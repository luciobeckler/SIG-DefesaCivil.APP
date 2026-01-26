import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environmentApiUrl } from 'src/app/helper/constantes';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private endPoint = `${environmentApiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  create(data: any): Observable<any> {
    return this.http.post(`${this.endPoint}/register`, data);
  }

  getAllRoles(): Observable<any> {
    return this.http.get(`${this.endPoint}/get-all-roles`);
  }

  getOutrosUsuarios(): Observable<any> {
    return this.http.get(`${this.endPoint}/outros-usuarios`);
  }

  getAll(): Observable<any> {
    return this.http.get(`${this.endPoint}`);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.endPoint}/${id}`);
  }

  update(id: string, data: any): Observable<any> {
    return this.http.put(`${this.endPoint}/${id}`, data);
  }
}
