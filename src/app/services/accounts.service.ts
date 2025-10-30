import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap, map, of } from 'rxjs';
import { URL } from 'src/app/helper/constantes';
import { ILogin } from 'src/app/interfaces/auth/ILogin';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  private endPoint = `${URL}/accounts`;
  private roles: string[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  login(data: ILogin): Observable<any> {
    return this.http
      .post(`${this.endPoint}/login`, data, {
        withCredentials: true,
      })
      .pipe(
        switchMap((loginResponse: any) => {
          if (loginResponse.primeiroAcesso === true) {
            return of(loginResponse);
          }

          return this.getAccountRole().pipe(map(() => loginResponse));
        })
      );
  }

  logOut(): Observable<any> {
    return this.http
      .post(`${this.endPoint}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          localStorage.clear();
          this.router.navigate(['/login']);
        })
      );
  }

  alterarSenha(data: string): Observable<any> {
    return this.http.post(
      `${this.endPoint}/alterar-senha`,
      { novaSenha: data },
      {
        withCredentials: true,
      }
    );
  }

  private getAccountRole(): Observable<any> {
    return this.http
      .get(`${this.endPoint}/get-account-roles`, {
        withCredentials: true,
      })
      .pipe(tap((res: any) => this.setRole(res)));
  }

  private setRole(roles: string[]) {
    localStorage.setItem('roles', JSON.stringify(roles));
  }

  getRole(): string[] {
    const roles = localStorage.getItem('roles');
    if (roles) {
      return JSON.parse(roles);
    }
    return [];
  }
}
