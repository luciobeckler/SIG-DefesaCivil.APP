import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environmentApiUrl } from 'src/environments/environment';
import { IAnexoUpload } from '../interfaces/anexos/IAnexos';

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
    listaAnexos: IAnexoUpload[],
  ): Observable<any> {
    const formData = new FormData();

    formData.append('TipoEntidade', 'Ocorrencia');

    listaAnexos.forEach((item, index) => {
      const prefix = `Anexos[${index}]`;

      formData.append(`${prefix}.Anexo`, item.file, item.file.name);

      if (
        item.localizacao.latitude !== undefined &&
        item.localizacao.latitude !== null
      ) {
        const latString = item.localizacao.latitude.toString();
        formData.append(`${prefix}.Latitude`, latString);
      }

      if (
        item.localizacao.longitude !== undefined &&
        item.localizacao.longitude !== null
      ) {
        const lonString = item.localizacao.longitude.toString();
        formData.append(`${prefix}.Longitude`, lonString);
      }

      if (item.dataHoraCaptura) {
        formData.append(`${prefix}.DataHoraCaptura`, item.dataHoraCaptura);
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
