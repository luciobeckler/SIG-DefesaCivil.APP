import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError, Observable, tap, switchMap } from 'rxjs';
import { URL } from 'src/app/helper/constantes';
import { ILogin } from 'src/app/interfaces/auth/ILogin';
import { IAlterarSenha } from 'src/app/interfaces/auth/IAlterarSenha';

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  private endPoint = `${URL}/accounts`;
  private roles: string[] = [];

  constructor(private http: HttpClient) {}

  login(data: ILogin): Observable<any> {
    return this.http
      .post(`${this.endPoint}/login`, data, {
        withCredentials: true,
      })
      .pipe(
        // só chama getAccountRole se o login retornar sucesso
        switchMap(() => this.getAccountRole())
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

  private setRole(role: string[]) {
    this.roles = role;
  }

  getRole(): string[] {
    return this.roles;
  }
}
