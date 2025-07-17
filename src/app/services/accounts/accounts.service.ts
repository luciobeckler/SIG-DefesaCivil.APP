import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError, Observable } from 'rxjs';
import { URL } from 'src/app/helper/constantes';
import { ILogin } from 'src/app/interfaces/auth/ILogin';
import { IAlterarSenha } from 'src/app/interfaces/auth/IAlterarSenha';

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  private endPoint = `${URL}/accounts`;

  constructor(private http: HttpClient) {}

  login(data: ILogin): Observable<any> {
    return this.http.post(`${this.endPoint}/login`, data, {
      withCredentials: true,
    });
  }

  alterarSenha(data: string): Observable<any> {
    return this.http.post(`${this.endPoint}/alterar-senha`, {novaSenha: data}, {
      withCredentials: true,
    });
  }
}
