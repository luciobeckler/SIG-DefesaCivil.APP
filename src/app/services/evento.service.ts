// /src/app/services/evento.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Import HttpHeaders
import { Observable } from 'rxjs';
import {
  IOcorrenciaDetalhes,
  IOcorrenciaPreview,
} from '../interfaces/ocorrencias/IEvento';
import { URL } from '../helper/constantes';
import { IEventoHistorico } from '../interfaces/ocorrencias/IEventoHistorico';

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

  getEventosPreview(): Observable<IOcorrenciaPreview[]> {
    return this.http.get<IOcorrenciaPreview[]>(`${this.apiUrl}/getAllPreview`, {
      withCredentials: true,
      headers: this.getHeaders(),
    });
  }

  getEventoDetalhes(id: string): Observable<IOcorrenciaDetalhes> {
    return this.http.get<IOcorrenciaDetalhes>(`${this.apiUrl}/${id}/detalhes`, {
      withCredentials: true,
      headers: this.getHeaders(),
    });
  }

  createEvento(formData: FormData): Observable<IOcorrenciaDetalhes> {
    return this.http.post<IOcorrenciaDetalhes>(this.apiUrl, formData, {
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
