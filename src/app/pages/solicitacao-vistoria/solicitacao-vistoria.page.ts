import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera';
import { ISolicitacaoVistoria } from 'src/app/interfaces/vistoria/ISolicitacaoVistoria';
import {
  IonHeader,
  IonList,
  IonToolbar,
  IonContent,
  IonTitle,
  IonItem,
  IonInput,
  IonButton,
  IonLabel,
} from '@ionic/angular/standalone';
import { NgxMaskDirective } from 'ngx-mask';
import { VistoriaService } from 'src/app/services/vistoria.service';

@Component({
  selector: 'app-solicitacao-vistoria',
  templateUrl: './solicitacao-vistoria.page.html',
  standalone: true,
  styleUrls: ['./solicitacao-vistoria.page.scss'],
  imports: [
    IonLabel,
    IonButton,
    IonInput,
    IonItem,
    IonTitle,
    IonContent,
    IonToolbar,
    IonList,
    IonHeader,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskDirective,
  ],
})
export class SolicitacaoVistoriaPage {
  private vistoriaService = inject(VistoriaService);

  form: FormGroup;
  fotosSelecionadas: Photo[] = [];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, Validators.minLength(11)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.minLength(10)]],

      cep: ['', [Validators.required, Validators.minLength(8)]],
      rua: ['', Validators.required],
      bairro: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
    });
  }

  async adicionarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
      });

      this.fotosSelecionadas.push(image);
    } catch (error) {
      console.log('Usuário cancelou a seleção de foto ou houve erro', error);
    }
  }

  removerFoto(index: number) {
    this.fotosSelecionadas.splice(index, 1);
  }

  async enviarSolicitacao() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert(
        'Por favor, preencha todos os campos obrigatórios marcados em vermelho.',
      );
      return;
    }

    if (this.fotosSelecionadas.length === 0) {
      alert('Por favor, adicione pelo menos uma foto do local.');
      return;
    }

    const formValues = this.form.value;

    const payload: ISolicitacaoVistoria = {
      solicitante: {
        nome: formValues.nome,
        cpf: formValues.cpf,
        email: formValues.email,
        telefone: formValues.telefone,
      },
      localizacao: {
        rua: formValues.rua,
        numero: formValues.numero,
        complemento: formValues.complemento,
        bairro: formValues.bairro,
        cep: formValues.cep,
        latitude: '',
        longitude: '',
      },
    };

    console.log('Processando envio...');

    // Agora o código aguarda a finalização e recebe o protocolo
    try {
      const protocoloRetornado = await this.enviarParaApi(
        payload,
        this.fotosSelecionadas,
      );
      if (protocoloRetornado) {
        alert(
          `Ocorrência criada com sucesso! Protocolo: ${protocoloRetornado}`,
        );
        // Aqui você pode limpar o form ou redirecionar a tela
      }
    } catch (error) {
      console.error(error);
      alert('Falha na comunicação com o servidor.');
    }
  }

  async enviarParaApi(
    dadosTexto: ISolicitacaoVistoria,
    fotosNativas: Photo[],
  ): Promise<string> {
    const formData = new FormData();

    // Envia o JSON como string
    formData.append('dadosJson', JSON.stringify(dadosTexto));

    for (let i = 0; i < fotosNativas.length; i++) {
      const foto = fotosNativas[i];
      if (!foto.webPath) continue;

      try {
        const response = await fetch(foto.webPath);
        const blob = await response.blob();

        // Assegura que o nome da chave é 'fotos' para bater com o [FromForm] do C#
        formData.append('fotos', blob, `foto_vistoria_${i}.${foto.format}`);
      } catch (error) {
        console.error(`Falha ao converter a foto ${i} para binário.`, error);
        throw new Error('Erro ao processar as imagens.');
      }
    }

    // Chama o serviço e retorna o protocolo
    const protocolo = await this.vistoriaService.criar(
      formData,
      'SolicitacaoVistoria',
    );
    return protocolo;
  }

  buscarCEP() {
    const cep: string = this.form.get('cep')?.value;

    if (cep && cep.length === 8) {
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.erro) {
            this.form.patchValue({
              rua: data.logradouro,
              bairro: data.bairro,
            });

            document.getElementById('inputNumero')?.focus();
          } else {
            alert('CEP não encontrado. Por favor, preencha manualmente.');
          }
        })
        .catch(() => alert('Erro ao buscar o CEP. Verifique sua internet.'));
    }
  }
}
