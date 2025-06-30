import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError, Observable } from 'rxjs';
import { URL } from 'src/app/helper/constantes';
import { ILogin } from 'src/app/interfaces/auth/ILogin';
import { IRegister } from 'src/app/interfaces/usuario/IRegister';

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  private endPoint = `${URL}/accounts`;

  constructor(private http: HttpClient) {}

  login(data: ILogin): Observable<any> {
    return this.http.post(`${this.endPoint}/login`, data);
  }
}
