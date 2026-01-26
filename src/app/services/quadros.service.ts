import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IQuadro, IQuadroDetalhes } from '../interfaces/ocorrencias/IQuadro';
import { environmentApiUrl } from '../helper/constantes';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QuadrosService {
  private apiUrl = `${environmentApiUrl}/Quadro`;
  constructor(private http: HttpClient) {}

  // GET: api/Quadro
  listarTodos(): Observable<IQuadro[]> {
    return this.http.get<IQuadro[]>(this.apiUrl);
  }

  // GET: api/Quadro/{id}
  obterPorId(id: string): Observable<IQuadroDetalhes> {
    return this.http.get<IQuadroDetalhes>(`${this.apiUrl}/${id}`);
  }
}
