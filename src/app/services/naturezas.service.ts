import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { INatureza, ISendNatureza } from '../interfaces/naturezas/INatureza';
import { environmentApiUrl } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NaturezaService {
  private endPoint = `${environmentApiUrl}/Natureza`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<INatureza[]> {
    // O Interceptor vai adicionar o Header Authorization automaticamente
    return this.http.get<INatureza[]>(`${this.endPoint}`);
  }

  create(dto: ISendNatureza): Observable<INatureza> {
    return this.http.post<INatureza>(`${this.endPoint}`, dto);
  }

  update(id: string, dto: ISendNatureza): Observable<boolean> {
    return this.http.put<boolean>(`${this.endPoint}/${id}`, dto);
  }

  delete(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.endPoint}/${id}`);
  }
}
