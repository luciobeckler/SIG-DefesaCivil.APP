import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError, Observable } from 'rxjs';
import { URL } from 'src/app/helper/constantes';
import { ILogin } from 'src/app/interfaces/auth/ILogin';

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  private endPoint = '/accounts';

  constructor(private http: HttpClient) {}

  login(data: ILogin): Observable<any> {
    return this.http
      .post(`${URL}${this.endPoint}/login`, data)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('Erro de rede ou CORS:', error.error);
    } else {
      console.error(`Erro da API [${error.status}]:`, error.error);
    }

    return throwError(
      () =>
        new Error(
          'Falha no login. Verifique suas credenciais e tente novamente.'
        )
    );
  }
}
