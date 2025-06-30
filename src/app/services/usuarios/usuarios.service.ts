import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URL } from 'src/app/helper/constantes';
import { IRegister } from 'src/app/interfaces/usuario/IRegister';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private endPoint = `${URL}/usuarios`;

  constructor(private http: HttpClient) {}

  create(data: any): Observable<any> {
    return this.http.post(`${this.endPoint}/register`, data);
  }

  getRoles(): Observable<any> {
    return this.http.get(`${this.endPoint}/roles`);
  }

  getAll(): Observable<any> {
    return this.http.get(`${this.endPoint}`);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.endPoint}/${id}`);
  }

  update(id: string, data: IRegister): Observable<any> {
    return this.http.put(`${this.endPoint}/${id}`, data);
  }
}
