import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URL } from 'src/app/helper/constantes';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private endPoint = `${URL}/usuarios`;

  constructor(private http: HttpClient) {}

  create(data: any): Observable<any> {
    return this.http.post(`${this.endPoint}/register`, data,{
      withCredentials: true,
    });
  }

  getAllRoles(): Observable<any> {
    return this.http.get(`${this.endPoint}/get-all-roles`,{
      withCredentials: true,
    });
  }

  getOutrosUsuarios(): Observable<any> {
    return this.http.get(`${this.endPoint}/outros-usuarios`,{
      withCredentials: true,
    });
  }

  getAll(): Observable<any> {
    return this.http.get(`${this.endPoint}`,{
      withCredentials: true,
    });
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.endPoint}/${id}`,{
      withCredentials: true,
    });
  }

  update(id: string, data: any): Observable<any> {
    return this.http.put(`${this.endPoint}/${id}`, data, {
      withCredentials: true,
    });
  }
}
