import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IQuadro, IQuadroDetalhes } from '../interfaces/ocorrencias/IQuadro';
import { Observable, tap } from 'rxjs';
import { environmentApiUrl } from 'src/environments/environment';
import { StorageService } from './storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class QuadrosService {
  private apiUrl = `${environmentApiUrl}/Quadro`;
  constructor(
    private http: HttpClient,
    private storageService: StorageService,
  ) {}

  // GET: api/Quadro
  getAllPreview(): Observable<IQuadro[]> {
    return this.http.get<IQuadro[]>(this.apiUrl).pipe(
      tap((data) => {
        this.storageService.set('quadros', data);
      }),
    );
  }

  // GET: api/Quadro/{id}
  getDetailsById(id: string): Observable<IQuadroDetalhes> {
    return this.http.get<IQuadroDetalhes>(`${this.apiUrl}/${id}`);
  }
}
