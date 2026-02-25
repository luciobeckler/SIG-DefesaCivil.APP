import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null,
  );

  constructor(
    private cookieService: CookieService,
    private accountsService: AuthService,
    private router: Router,
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    let authReq = request;
    const token = this.cookieService.get('access_token');

    const isAuthRequest =
      request.url.includes('/refresh-token') ||
      request.url.includes('/login') ||
      request.url.includes('/logout');

    if (token && !isAuthRequest) {
      authReq = this.addTokenHeader(request, token);
    }

    return next.handle(authReq).pipe(
      catchError((error) => {
        const isResponse401 =
          error instanceof HttpErrorResponse && error.status === 401;

        if (isResponse401) {
          if (isAuthRequest) {
            return throwError(() => error);
          } else {
            return this.handle401Error(authReq, next);
          }
        } else {
          return throwError(() => error);
        }
      }),
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.accountsService.refreshToken().pipe(
        switchMap((tokenResponse: any) => {
          this.isRefreshing = false;

          const newToken =
            tokenResponse.accessToken || tokenResponse.access_token;

          if (newToken) {
            this.cookieService.set('access_token', newToken);
            this.refreshTokenSubject.next(newToken);
            return next.handle(this.addTokenHeader(request, newToken));
          }

          this.accountsService.logOut().subscribe();
          return throwError(() => new Error('Token refresh failed'));
        }),
        catchError((err) => {
          this.isRefreshing = false;

          this.accountsService.logOut().subscribe({
            error: () => {
              this.cookieService.delete('access_token');
              this.router.navigate(['/login']);
            },
          });

          return throwError(() => err);
        }),
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((jwt) => {
          return next.handle(this.addTokenHeader(request, jwt));
        }),
      );
    }
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
