// /src/app/services/evento.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IEventoDetalhes, IEventoPreview } from '../interfaces/eventos/IEvento';
import { URL } from '../helper/constantes';
import { IEventoHistorico } from '../interfaces/eventos/IEventoHistorico';

@Injectable({
  providedIn: 'root',
})
export class EventoService {
  private apiUrl = `${URL}/Evento`;

  constructor(private http: HttpClient) {}

  getEventosPreview(): Observable<IEventoPreview[]> {
    return this.http.get<IEventoPreview[]>(`${this.apiUrl}/getAllPreview`, {
      withCredentials: true,
    });
  }

  getEventoDetalhes(id: string): Observable<IEventoDetalhes> {
    return this.http.get<IEventoDetalhes>(`${this.apiUrl}/${id}/detalhes`, {
      withCredentials: true,
    });
  }

  createEvento(dto: any): Observable<IEventoDetalhes> {
    return this.http.post<IEventoDetalhes>(this.apiUrl, dto, {
      withCredentials: true,
    });
  }

  updateEvento(id: string, dto: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto, {
      withCredentials: true,
    });
  }

  deleteEvento(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }

  getHistoricoDetalhes(id: string): Observable<IEventoHistorico[]> {
    return this.http.get<IEventoHistorico[]>(`${this.apiUrl}/${id}/historico`, {
      withCredentials: true,
    });
  }
}
