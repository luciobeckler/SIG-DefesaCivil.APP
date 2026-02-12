import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environmentApiUrl } from 'src/environments/environment';
import { StorageService } from './storage/storage.service';
import { IQuadro } from '../interfaces/ocorrencias/IQuadro';

@Injectable({
  providedIn: 'root',
})
export class QuadrosService {
  private apiUrl = `${environmentApiUrl}/Quadro`;
  private readonly CACHE_KEY = 'SIG_QUADROS_CACHE';

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
  ) {}

  // GET: api/Quadro
  getQuadros(): Observable<IQuadro[]> {
    return this.http.get<IQuadro[]>(this.apiUrl).pipe(
      tap((data) => {
        this.storageService.set('quadros', data);
      }),
    );
  }

  async salvarQuadrosEmCache(quadros: IQuadro[]) {
    await this.storageService.set(this.CACHE_KEY, quadros);
  }

  async obterQuadrosDoCache(): Promise<IQuadro[]> {
    return (await this.storageService.get(this.CACHE_KEY)) || [];
  }
}
