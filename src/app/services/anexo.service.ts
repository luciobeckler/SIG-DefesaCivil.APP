import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environmentApiUrl } from 'src/environments/environment';
import { INovoAnexo } from '../interfaces/anexos/IAnexos';

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

  // Correção 1: Assinatura atualizada para INovoAnexo[]
  uploadAnexos(
    ocorrenciaId: string,
    listaArquivos: INovoAnexo[],
  ): Observable<any> {
    const formData = new FormData();

    formData.append('Entidade', 'Ocorrencia');

    // Correção 2: Montagem do FormData com indexação para o C#
    listaArquivos.forEach((item, index) => {
      const extensao = item.file.name.split('.').pop();
      const nomeFinal = item.nome.endsWith(`.${extensao}`)
        ? item.nome
        : `${item.nome}.${extensao}`;

      // Prefixo base para este item na lista do C#
      const prefix = `Arquivos[${index}]`;

      // 1. O Arquivo físico
      formData.append(`${prefix}.Arquivo`, item.file, nomeFinal);

      // 2. Metadados Geográficos e de Tempo (se existirem)
      if (item.latitudeCaptura !== undefined && item.latitudeCaptura !== null) {
        formData.append(`${prefix}.Latitude`, item.latitudeCaptura.toString());
      }

      if (
        item.longitudeCaptura !== undefined &&
        item.longitudeCaptura !== null
      ) {
        formData.append(
          `${prefix}.Longitude`,
          item.longitudeCaptura.toString(),
        );
      }

      if (item.dataHoraCaptura) {
        // Garante envio no formato ISO-8601 para o C# fazer o parse de DateTime sem quebrar
        const dataIso =
          typeof item.dataHoraCaptura === 'string'
            ? item.dataHoraCaptura
            : item.dataHoraCaptura.toISOString();

        formData.append(`${prefix}.DataHoraCaptura`, dataIso);
      }
    });

    return this.http.post(`${this.anexoUrl}/${ocorrenciaId}/anexos`, formData);
  }

  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  base64ToFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }
}
