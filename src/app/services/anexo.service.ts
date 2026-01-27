import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environmentApiUrl } from '../helper/constantes';
import { Observable } from 'rxjs';
// ... outros imports

@Injectable({
  providedIn: 'root',
})
export class AnexoService {
  private anexoUrl = `${environmentApiUrl}/Anexo`;

  constructor(private http: HttpClient) {}
  removerAnexos(entidadeId: string, idsAnexos: string[]): Observable<void> {
    const options = {
      body: {
        entidadeTipo: 'Ocorrencia',
        idsAnexos: idsAnexos,
      },
    };

    return this.http.delete<void>(
      `${this.anexoUrl}/${entidadeId}/anexos`,
      options,
    );
  }
  uploadAnexos(
    ocorrenciaId: string,
    listaArquivos: { file: File; nome: string }[],
  ): Observable<any> {
    const formData = new FormData();

    formData.append('entidade', 'Ocorrencia');

    listaArquivos.forEach((item) => {
      const extensao = item.file.name.split('.').pop();
      const nomeFinal = item.nome.endsWith(`.${extensao}`)
        ? item.nome
        : `${item.nome}.${extensao}`;

      formData.append('arquivos', item.file, nomeFinal);
    });

    return this.http.post(`${this.anexoUrl}/${ocorrenciaId}/anexos`, formData);
  }
}
