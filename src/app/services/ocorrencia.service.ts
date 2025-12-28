import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IQuadro, IQuadroDetalhes } from '../interfaces/ocorrencias/IQuadro';
import { URL } from '../helper/constantes';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OcorrenciaService {
  private apiUrl = `${URL}/Ocorrencia`;
  constructor(private http: HttpClient) {}

  transicionarOcorrencia(
    OcorrenciaId: string,
    EtapaAtualId: string,
    EtapaDestinoId: string
  ): Observable<any> {
    const body = {
      OcorrenciaId: OcorrenciaId,
      EtapaAtualId: EtapaAtualId,
      EtapaDestinoId: EtapaDestinoId,
    };

    return this.http.post(`${this.apiUrl}/alterar-etapa`, body, {
      withCredentials: true,
    });
  }
}
