import { addIcons } from 'ionicons';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { format, parse, parseISO } from 'date-fns';
import {
  enumToArray,
  EGrauRisco,
  ETipoRisco,
  EAnalisePreliminar,
  ECaracterizacaoLocal,
  ETipoEdificacao,
  ETipoEstrutura,
  ETipificacaoOcorrencia,
  EMotivacao,
  EAreaAfetada,
  ERegimeOcupacao,
} from 'src/app/helper/OcorrenciaEnums';
import { OcorrenciaService } from 'src/app/services/ocorrencia.service'; // Supondo que exista
import { dateValidator, formatarLabel } from 'src/app/helper/funcions'; // Se tiver seu helper global
import { INovoAnexo } from 'src/app/interfaces/anexos/IAnexos';
import {
  closeCircle,
  cloudUpload,
  documentAttach,
  trash,
} from 'ionicons/icons';
import { AnexoService } from 'src/app/services/anexo.service';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonContent,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonLabel,
  IonInput,
  IonDatetime,
  IonCheckbox,
  IonDatetimeButton,
  IonModal,
  IonRow,
  IonCol,
  IonBadge,
  IonList,
  IonListHeader,
  IonNote,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonText,
  ModalController,
} from '@ionic/angular/standalone';
import { NgxMaskDirective } from 'ngx-mask';
import { HistoricoOcorrenciaComponent } from 'src/app/components/historico-ocorrencia/historico-ocorrencia.component';
import { EPermission } from 'src/app/auth/permissions.enum';
import { HasPermissionDirective } from 'src/app/directives/has-permission.directive';

@Component({
  selector: 'app-ocorrencia-form',
  templateUrl: './ocorrencia-form.component.html',
  styleUrls: ['./ocorrencia-form.component.scss'],
  standalone: true,
  imports: [
    IonText,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonNote,
    IonListHeader,
    IonSelect,
    IonSelectOption,
    NgxMaskDirective,
    IonList,
    IonBadge,
    IonCol,
    IonRow,
    IonCheckbox,
    IonInput,
    IonLabel,
    IonItem,
    IonAccordion,
    IonAccordionGroup,
    IonContent,
    IonTitle,
    IonIcon,
    IonButton,
    IonButtons,
    IonToolbar,
    IonHeader,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HasPermissionDirective,
  ],
})
export class OcorrenciaFormPage implements OnInit {
  // Injeção de Dependência
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private navCtrl = inject(NavController);
  private ocorrenciaService = inject(OcorrenciaService);
  private anexoService = inject(AnexoService);
  private toastCtrl = inject(ToastController);
  private quadroIdOrigem: string | null = null;
  private modalCtrl = inject(ModalController);
  hrefVoltar = '/home';
  form!: FormGroup;
  isEditing = false;
  ocorrenciaId: string | null = null;
  tituloPagina = 'Nova Ocorrência';
  perms = EPermission;

  // --- Listas para os Selects ---
  opcoesGrauRisco = enumToArray(EGrauRisco);
  opcoesRegime = enumToArray(ERegimeOcupacao);
  opcoesAnalise = enumToArray(EAnalisePreliminar);
  opcoesCaracterizacao = enumToArray(ECaracterizacaoLocal);
  opcoesEdificacao = enumToArray(ETipoEdificacao);
  opcoesEstrutura = enumToArray(ETipoEstrutura);
  opcoesTipoRisco = enumToArray(ETipoRisco);
  opcoesTipificacao = enumToArray(ETipificacaoOcorrencia);
  opcoesMotivacao = enumToArray(EMotivacao);
  opcoesAreaAfetada = enumToArray(EAreaAfetada);

  anexosExistentes: any[] = [];
  idsParaRemover: string[] = [];

  novosAnexos: INovoAnexo[] = [];

  // Helper local para usar no template (caso não tenha o global)
  formatarLabel = (val: string) => val.replace(/([A-Z])/g, ' $1').trim();

  constructor() {
    this.buildForm();
    addIcons({ trash, cloudUpload, documentAttach, closeCircle });
  }

  ngOnInit() {
    this.quadroIdOrigem = this.route.snapshot.queryParamMap.get('quadroId');

    if (this.quadroIdOrigem) {
      this.hrefVoltar = `/home/quadro/${this.quadroIdOrigem}`;
    }

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id && id !== 'nova') {
        this.isEditing = true;
        this.ocorrenciaId = id;
        this.tituloPagina = 'Editar Ocorrência';
        this.carregarDados(id);
      } else {
        const agora = format(new Date(), 'dd/MM/yyyy HH:mm');
        this.form.patchValue({
          dataEHoraInicioAtendimento: agora,
        });
      }
    });
  }

  buscarCEP() {
    const cep = this.form.get('enderecoCEP')?.value;
    if (cep && cep.length === 8) {
      // Chame seu serviço ou use fetch direto para ViaCEP
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.erro) {
            this.form.patchValue({
              enderecoRua: data.logradouro,
              enderecoBairro: data.bairro,
              enderecoNumero: data.numero,
            });
          }
        });
    }
  }

  buildForm() {
    this.form = this.fb.group({
      // --- Dados Básicos ---
      dataEHoraDoOcorrido: [null, [Validators.required, dateValidator()]],
      dataEHoraInicioAtendimento: [null, [dateValidator()]],
      dataEHoraTerminoAtendimento: [null, [dateValidator()]],

      // --- Endereço ---
      enderecoRua: [''],
      enderecoNumero: [''],
      enderecoComplemento: [''],
      enderecoBairro: [''],
      enderecoCEP: [''],

      // --- Solicitante ---
      solicitanteNome: [''],
      solicitanteCPF: [''],
      solicitanteRG: [''],

      // --- Classificação de Risco (Single) ---
      grauDeRisco: [null, Validators.required],
      regimeDeOcupacaoDoImovel: [null],

      // --- Classificação Múltipla (Arrays) ---
      analisePreliminar: [[]],
      caracterizacaoDoLocal: [[]],
      edificacao: [[]],
      estrutura: [[]],
      tipoDeRisco: [[]],
      tipificacaoDaOcorrencia: [[]],
      motivacao: [[]],
      areasAfetadas: [[]],

      // --- Dados Quantitativos ---
      possuiIPTU: [''], // Pode ser string ou bool dependendo do seu backend/enum
      numeroDeMoradias: [null],
      numeroDeComodos: [null],
      numeroDePavimentos: [null],
      possuiUnidadeFamiliar: [false],
      numeroDeDeficientes: [null],
      numeroDeCriancas: [null],
      numeroDeAdultos: [null],
      numeroDeIdosos: [null],
    });
  }

  carregarDados(id: string) {
    this.ocorrenciaService.obterDetalhesPorId(id).subscribe({
      next: (data) => {
        if (data.dataEHoraDoOcorrido) {
          const dataObj = parseISO(data.dataEHoraDoOcorrido);
          data.dataEHoraDoOcorrido = format(dataObj, 'dd/MM/yyyy HH:mm');
        }

        if (data.dataEHoraInicioAtendimento) {
          const dataObj = parseISO(data.dataEHoraInicioAtendimento);
          data.dataEHoraInicioAtendimento = format(dataObj, 'dd/MM/yyyy HH:mm');
        }

        if (data.dataEHoraTerminoAtendimento) {
          const dataObj = parseISO(data.dataEHoraTerminoAtendimento);
          data.dataEHoraTerminoAtendimento = format(
            dataObj,
            'dd/MM/yyyy HH:mm',
          );
        }

        this.form.patchValue(data);
      },
      error: () => this.mostrarToast('Erro ao carregar dados', 'danger'),
    });
    this.carregarAnexos(id);
  }

  carregarAnexos(id: string) {
    this.ocorrenciaService.obterAnexos(id).subscribe({
      next: (data) => {
        this.anexosExistentes = data;
        this.idsParaRemover = [];
      },
      error: (err) => console.error('Erro ao listar anexos', err),
    });
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.novosAnexos.push({
          file: file,
          nome: file.name,
          tamanho: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        });
      }
    }
    event.target.value = '';
  }

  removerNovoAnexo(index: number) {
    this.novosAnexos.splice(index, 1);
  }

  marcarParaRemocao(anexo: any) {
    this.idsParaRemover.push(anexo.id);
    // Remove visualmente da lista
    this.anexosExistentes = this.anexosExistentes.filter(
      (a) => a.id !== anexo.id,
    );
  }

  async salvar() {
    debugger;
    if (this.form.invalid) {
      console.error('--- FORMULÁRIO INVÁLIDO ---');
      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.get(key);
        if (control?.invalid) {
          console.log(`Campo: ${key}, Erros:`, control.errors);
          console.log(`Valor atual:`, control.value);
        }
      });
      this.form.markAllAsTouched();
      return; // Para aqui para você ver o log
    }

    const loading = await this.toastCtrl.create({
      message: 'Salvando...',
      duration: 10000,
    }); // Loader ficticio
    loading.present();

    try {
      let idAtual = this.ocorrenciaId;
      const dto = { ...this.form.value };

      dto.dataEHoraDoOcorrido = this.converterParaISO(dto.dataEHoraDoOcorrido);
      dto.dataEHoraInicioAtendimento = this.converterParaISO(
        dto.dataEHoraInicioAtendimento,
      );
      dto.dataEHoraTerminoAtendimento = this.converterParaISO(
        dto.dataEHoraTerminoAtendimento,
      );

      if (this.isEditing && idAtual) {
        await this.ocorrenciaService.atualizar(idAtual, dto).toPromise();
      } else {
        // Se for criar, precisamos do ID retornado para vincular os anexos
        const novaOcorrencia = await this.ocorrenciaService
          .criar(dto, this.quadroIdOrigem || '')
          .toPromise();
        idAtual = novaOcorrencia?.id ?? null;
      }

      if (!idAtual) throw new Error('ID da ocorrência não identificado.');

      // PASSO 2: Remover Anexos (Se houver)
      if (this.idsParaRemover.length > 0) {
        await this.anexoService
          .removerAnexos(idAtual, this.idsParaRemover)
          .toPromise();
      }

      // PASSO 3: Upload Novos Anexos (Se houver)
      if (this.novosAnexos.length > 0) {
        await this.anexoService
          .uploadAnexos(idAtual, this.novosAnexos)
          .toPromise();
      }

      loading.dismiss();
      this.mostrarToast('Dados salvos com sucesso!', 'success');
      this.navCtrl.back();
    } catch (error) {
      loading.dismiss();
      console.error(error);
      this.mostrarToast('Erro ao processar a solicitação.', 'danger');
    }
  }

  async mostrarToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: color,
    });
    toast.present();
  }

  voltar() {
    if (this.quadroIdOrigem) {
      this.navCtrl.navigateBack(['/home/quadro', this.quadroIdOrigem]);
    } else {
      this.navCtrl.navigateBack('/home');
    }
  }

  async abrirHistorico() {
    if (!this.ocorrenciaId) return;

    const modal = await this.modalCtrl.create({
      component: HistoricoOcorrenciaComponent,
      componentProps: {
        ocorrenciaId: this.ocorrenciaId,
      },
    });

    await modal.present();
  }

  converterParaISO = (valorData: string | null) => {
    if (!valorData || valorData.length < 16) return null;
    try {
      const dataObj = parse(valorData, 'dd/MM/yyyy HH:mm', new Date());
      return dataObj.toISOString();
    } catch (e) {
      console.error('Erro ao converter data:', valorData);
      return null;
    }
  };
}
