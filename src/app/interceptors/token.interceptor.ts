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
import { AccountsService } from '../services/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  // Controle de concorrência
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  constructor(
    private cookieService: CookieService,
    private accountsService: AccountsService,
    private router: Router
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    let authReq = request;
    const token = this.cookieService.get('access_token');
    if (token) {
      authReq = this.addTokenHeader(request, token);
    }

    return next.handle(authReq).pipe(
      catchError((error) => {
        const isResponse401 =
          error instanceof HttpErrorResponse && error.status === 401;
        if (isResponse401) {
          const isRefreshOrLogin =
            request.url.includes('refresh-token') ||
            request.url.includes('login');
          if (isRefreshOrLogin) {
            this.accountsService.logOut();
            return throwError(() => error);
          } else {
            return this.handle401Error(authReq, next);
          }
        } else {
          return throwError(() => error);
        }
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    debugger;
    if (!this.isRefreshing) {
      // CENÁRIO A: Ninguém está renovando ainda. Eu sou o primeiro.
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null); // Bloqueia quem vier depois

      return this.accountsService.refreshToken().pipe(
        switchMap((tokenResponse: any) => {
          this.isRefreshing = false;

          // Notifica os outros que o novo token chegou
          this.refreshTokenSubject.next(tokenResponse.accessToken);

          // Refaz a requisição original com o novo token
          return next.handle(
            this.addTokenHeader(request, tokenResponse.accessToken)
          );
        }),
        catchError((err) => {
          // Se a renovação falhar, desloga o usuário
          this.isRefreshing = false;
          this.accountsService.logOut().subscribe(); // Limpa cookies e redireciona
          return throwError(() => err);
        })
      );
    } else {
      // CENÁRIO B: Já existe uma renovação em andamento. Entro na fila.
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null), // Espera o valor não ser null
        take(1), // Pega apenas o primeiro valor válido e completa o Observable
        switchMap((jwt) => {
          // Refaz a requisição com o token que acabou de ser gerado
          return next.handle(this.addTokenHeader(request, jwt));
        })
      );
    }
  }

  // Helper para clonar requisição e adicionar header
  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
