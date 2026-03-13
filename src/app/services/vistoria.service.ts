import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs'; // IMPORT CRÍTICO
import { environmentApiUrl } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VistoriaService {
  private anexoUrl = `${environmentApiUrl}/Vistoria`;

  constructor(private http: HttpClient) {}

  public async criar(
    formData: FormData,
    tipoCadastro: string,
  ): Promise<string> {
    // CORREÇÃO: Cadeia de métodos para respeitar a imutabilidade do HttpParams
    const params = new HttpParams().set('tipoCadastroOcorrencia', tipoCadastro);

    // CORREÇÃO: Informar ao HttpClient que a resposta é um texto puro (o protocolo), e não um JSON.
    const request$ = this.http.post(this.anexoUrl, formData, {
      params: params,
      responseType: 'text',
    });

    // CORREÇÃO: Execução limpa da Promise
    return await firstValueFrom(request$);
  }
}
