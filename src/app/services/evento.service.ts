// /src/app/services/evento.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Import HttpHeaders
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

  // --- Helper to get headers (removes Content-Type for FormData) ---
  private getHeaders(isFormData: boolean = false): HttpHeaders {
    let headers = new HttpHeaders();
    if (!isFormData) {
      headers = headers.set('Content-Type', 'application/json');
    }

    return headers;
  }

  getEventosPreview(): Observable<IEventoPreview[]> {
    return this.http.get<IEventoPreview[]>(`${this.apiUrl}/getAllPreview`, {
      withCredentials: true,
      headers: this.getHeaders(),
    });
  }

  getEventoDetalhes(id: string): Observable<IEventoDetalhes> {
    return this.http.get<IEventoDetalhes>(`${this.apiUrl}/${id}/detalhes`, {
      withCredentials: true,
      headers: this.getHeaders(),
    });
  }

  createEvento(formData: FormData): Observable<IEventoDetalhes> {
    return this.http.post<IEventoDetalhes>(this.apiUrl, formData, {
      withCredentials: true,
      headers: this.getHeaders(true),
    });
  }

  updateEvento(id: string, formData: FormData): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, formData, {
      withCredentials: true,
      headers: this.getHeaders(true),
    });
  }

  deleteEvento(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
      headers: this.getHeaders(),
    });
  }

  getHistoricoDetalhes(id: string): Observable<IEventoHistorico[]> {
    return this.http.get<IEventoHistorico[]>(`${this.apiUrl}/${id}/historico`, {
      withCredentials: true,
      headers: this.getHeaders(),
    });
  }
}
