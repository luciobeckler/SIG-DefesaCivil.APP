import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {
  ICreateOrEditOcorrenciaDTO,
  IOcorrencia,
  IHistoricoOcorrenciaDTO,
} from '../interfaces/ocorrencias/IOcorrencias';
import { environmentApiUrl } from 'src/environments/environment';
import { StorageService } from './storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class OcorrenciaService {
  private apiUrl = `${environmentApiUrl}/Ocorrencia`;
  public offlineStackChanged = new Subject<void>();

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
  ) {}

  /**
   * GET api/Ocorrencia/{id}/detalhes
   * Retorna os detalhes completos de uma ocorrência.
   */
  obterDetalhesPorId(id: string): Observable<IOcorrencia> {
    return this.http.get<IOcorrencia>(`${this.apiUrl}/${id}/detalhes`);
  }

  /**
   * POST api/Ocorrencia?quadroId=...
   * Cria uma nova ocorrência vinculada a um quadro.
   */
  criar(
    dto: ICreateOrEditOcorrenciaDTO,
    quadroId: string,
  ): Observable<IOcorrencia> {
    // Passando quadroId via Query String
    let params = new HttpParams().set('quadroId', quadroId);

    return this.http.post<IOcorrencia>(`${this.apiUrl}`, dto, {
      params: params,
    });
  }

  /**
   * PUT api/Ocorrencia/{id}
   * Atualiza os dados de uma ocorrência existente.
   */
  atualizar(id: string, dto: ICreateOrEditOcorrenciaDTO): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }

  /**
   * DELETE api/Ocorrencia/{id}
   * Remove uma ocorrência (Soft delete).
   */
  deletar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET api/Ocorrencia/{id}/anexos
   * Retorna a lista de anexos da ocorrência.
   */
  obterAnexos(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/anexos`);
  }

  /**
   * GET api/Ocorrencia/{id}/historico
   * Retorna o log de alterações da ocorrência.
   */
  obterHistorico(id: string): Observable<IHistoricoOcorrenciaDTO[]> {
    return this.http.get<IHistoricoOcorrenciaDTO[]>(
      `${this.apiUrl}/${id}/historico`,
    );
  }

  /**
   * GET api/Ocorrencia/status
   * Retorna as opções de status (Enums) disponíveis.
   */
  obterStatusOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/status`);
  }

  /**
   * POST api/Ocorrencia/alterar-etapa
   * Move a ocorrência de uma coluna (etapa) para outra no Kanban.
   */
  transicionarOcorrencia(
    ocorrenciaId: string,
    etapaAtualId: string,
    etapaDestinoId: string,
  ): Observable<any> {
    const body = {
      ocorrenciaId: ocorrenciaId,
      etapaAtualId: etapaAtualId,
      etapaDestinoId: etapaDestinoId,
    };

    return this.http.post(`${this.apiUrl}/alterar-etapa`, body);
  }

  public async getFilaOffline(): Promise<any[]> {
    return (await this.storageService.get('fila_ocorrencias')) || [];
  }

  public async adicionarNaFila(item: any) {
    const fila = await this.getFilaOffline();
    fila.push(item);
    await this.storageService.set('fila_ocorrencias', fila);

    this.offlineStackChanged.next();
  }

  public async limparFila() {
    await this.storageService.remove('fila_ocorrencias');
    this.offlineStackChanged.next();
  }
}
