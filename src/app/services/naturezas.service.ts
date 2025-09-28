import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { INatureza } from '../interfaces/naturezas/INatureza';
import { URL } from '../helper/constantes';

@Injectable({
  providedIn: 'root',
})
export class NaturezaService {
  private endPoint = `${URL}/Naturezas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<INatureza[]> {
    return this.http.get<INatureza[]>(`${this.endPoint}`, {
      withCredentials: true,
    });
  }

  create(dto: any): Observable<INatureza> {
    return this.http.post<INatureza>(`${this.endPoint}`, dto, {
      withCredentials: true,
    });
  }

  update(codigo: string, dto: any): Observable<boolean> {
    return this.http.put<boolean>(`${this.endPoint}/${codigo}`, dto, {
      withCredentials: true,
    });
  }

  delete(codigo: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.endPoint}/${codigo}`, {
      withCredentials: true,
    });
  }
}
