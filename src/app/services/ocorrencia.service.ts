import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL } from '../helper/constantes'; // Sua constante com localhost ou produção
import { Observable } from 'rxjs';
import {
  ICreateOrEditOcorrenciaDTO,
  IOcorrenciaDetalhesDTO,
  IHistoricoOcorrenciaDTO,
} from '../interfaces/ocorrencias/IOcorrencias';

@Injectable({
  providedIn: 'root',
})
export class OcorrenciaService {
  private apiUrl = `${URL}/Ocorrencia`;

  constructor(private http: HttpClient) {}

  /**
   * GET api/Ocorrencia/{id}/detalhes
   * Retorna os detalhes completos de uma ocorrência.
   */
  obterDetalhesPorId(id: string): Observable<IOcorrenciaDetalhesDTO> {
    return this.http.get<IOcorrenciaDetalhesDTO>(
      `${this.apiUrl}/${id}/detalhes`,
      {
        withCredentials: true,
      }
    );
  }

  /**
   * POST api/Ocorrencia?quadroId=...
   * Cria uma nova ocorrência vinculada a um quadro.
   */
  criar(
    dto: ICreateOrEditOcorrenciaDTO,
    quadroId: string
  ): Observable<IOcorrenciaDetalhesDTO> {
    // Passando quadroId via Query String
    let params = new HttpParams().set('quadroId', quadroId);

    return this.http.post<IOcorrenciaDetalhesDTO>(`${this.apiUrl}`, dto, {
      params: params,
      withCredentials: true,
    });
  }

  /**
   * PUT api/Ocorrencia/{id}
   * Atualiza os dados de uma ocorrência existente.
   */
  atualizar(id: string, dto: ICreateOrEditOcorrenciaDTO): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto, {
      withCredentials: true,
    });
  }

  /**
   * DELETE api/Ocorrencia/{id}
   * Remove uma ocorrência (Soft delete).
   */
  deletar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * GET api/Ocorrencia/{id}/anexos
   * Retorna a lista de anexos da ocorrência.
   */
  obterAnexos(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/anexos`, {
      withCredentials: true,
    });
  }

  /**
   * GET api/Ocorrencia/{id}/historico
   * Retorna o log de alterações da ocorrência.
   */
  obterHistorico(id: string): Observable<IHistoricoOcorrenciaDTO[]> {
    return this.http.get<IHistoricoOcorrenciaDTO[]>(
      `${this.apiUrl}/${id}/historico`,
      {
        withCredentials: true,
      }
    );
  }

  /**
   * GET api/Ocorrencia/status
   * Retorna as opções de status (Enums) disponíveis.
   */
  obterStatusOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/status`, {
      withCredentials: true,
    });
  }

  /**
   * POST api/Ocorrencia/alterar-etapa
   * Move a ocorrência de uma coluna (etapa) para outra no Kanban.
   */
  transicionarOcorrencia(
    ocorrenciaId: string,
    etapaAtualId: string,
    etapaDestinoId: string
  ): Observable<any> {
    const body = {
      ocorrenciaId: ocorrenciaId,
      etapaAtualId: etapaAtualId,
      etapaDestinoId: etapaDestinoId,
    };

    return this.http.post(`${this.apiUrl}/alterar-etapa`, body, {
      withCredentials: true,
    });
  }
}
