import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { lastValueFrom } from 'rxjs';

import { NavController, ModalController } from '@ionic/angular/standalone';
import { Network } from '@capacitor/network';
import { addIcons } from 'ionicons';
import {
  closeCircle,
  cloudUpload,
  documentAttach,
  trash,
  warning,
} from 'ionicons/icons';
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
  IonCheckbox,
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
} from '@ionic/angular/standalone';

import { format, parse, parseISO } from 'date-fns';
import { NgxMaskDirective } from 'ngx-mask';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';

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
import { INovoAnexo } from 'src/app/interfaces/anexos/IAnexos';
import { EPermission } from 'src/app/auth/permissions.enum';

import { OcorrenciaService } from 'src/app/services/ocorrencia.service';
import { AnexoService } from 'src/app/services/anexo.service';
import { LoadingService } from 'src/app/services/loading.service';
import { dateValidator } from 'src/app/helper/funcions';
import { HasPermissionDirective } from 'src/app/directives/has-permission.directive';
import { HistoricoOcorrenciaComponent } from 'src/app/components/historico-ocorrencia/historico-ocorrencia.component';
import { ToastService } from 'src/app/services/toast/toast.service';
import { LocationStateService } from 'src/app/services/location-state.service';

@Component({
  selector: 'app-ocorrencia-form',
  templateUrl: './ocorrencia-form.component.html',
  styleUrls: ['./ocorrencia-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgxMaskDirective,
    HasPermissionDirective,

    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle,
    IonContent,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonInput,
    IonText,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonCheckbox,
    IonBadge,
    IonRow,
    IonCol,
    IonAccordion,
    IonAccordionGroup,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
  ],
})
export class OcorrenciaFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private navCtrl = inject(NavController);
  private modalCtrl = inject(ModalController);
  private ocorrenciaService = inject(OcorrenciaService);
  private anexoService = inject(AnexoService);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);
  private locationStateService = inject(LocationStateService);

  public form!: FormGroup;
  public tituloPagina = 'Nova Ocorrência';
  public hrefVoltar = '/home';
  public isEditing = false;
  public perms = EPermission;

  private ocorrenciaId: string | null = null;
  private quadroIdOrigem: string | null = null;

  public readonly opcoesGrauRisco = enumToArray(EGrauRisco);
  public readonly opcoesRegime = enumToArray(ERegimeOcupacao);
  public readonly opcoesAnalise = enumToArray(EAnalisePreliminar);
  public readonly opcoesCaracterizacao = enumToArray(ECaracterizacaoLocal);
  public readonly opcoesEdificacao = enumToArray(ETipoEdificacao);
  public readonly opcoesEstrutura = enumToArray(ETipoEstrutura);
  public readonly opcoesTipoRisco = enumToArray(ETipoRisco);
  public readonly opcoesTipificacao = enumToArray(ETipificacaoOcorrencia);
  public readonly opcoesMotivacao = enumToArray(EMotivacao);
  public readonly opcoesAreaAfetada = enumToArray(EAreaAfetada);

  public anexosExistentes: any[] = [];
  public novosAnexos: INovoAnexo[] = [];
  private idsParaRemover: string[] = [];

  constructor() {
    this.buildForm();
    addIcons({ trash, cloudUpload, documentAttach, closeCircle });
  }

  async ngOnInit() {
    this.quadroIdOrigem = this.route.snapshot.queryParamMap.get('quadroId');
    if (this.quadroIdOrigem) {
      this.hrefVoltar = `/home/quadro/${this.quadroIdOrigem}`;
    }

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id && id !== 'nova') {
        this.configurarModoEdicao(id);
      } else {
        this.configurarModoCriacao();
      }
    });
  }

  private configurarModoEdicao(id: string) {
    this.isEditing = true;
    this.ocorrenciaId = id;
    this.tituloPagina = 'Editar Ocorrência';
    this.carregarDados(id);
  }

  private configurarModoCriacao() {
    const agora = new Date();
    this.form.patchValue({
      dataInicioAtendimento: format(agora, 'dd/MM/yyyy'),
      horaInicioAtendimento: format(agora, 'HH:mm'),
    });
  }

  private buildForm() {
    this.form = this.fb.group({
      dataDoOcorrido: [null, [Validators.required]],
      horaDoOcorrido: [null, [Validators.required]],
      dataInicioAtendimento: [null],
      horaInicioAtendimento: [null],
      dataTerminoAtendimento: [null],
      horaTerminoAtendimento: [null],

      enderecoRua: [''],
      enderecoNumero: [''],
      enderecoComplemento: [''],
      enderecoBairro: [''],
      enderecoCEP: [''],

      solicitanteNome: [''],
      solicitanteCPF: [''],
      solicitanteRG: [''],

      grauDeRisco: [null, Validators.required],
      regimeDeOcupacaoDoImovel: [null],
      analisePreliminar: [[]],
      caracterizacaoDoLocal: [[]],
      edificacao: [[]],
      estrutura: [[]],
      tipoDeRisco: [[]],
      tipificacaoDaOcorrencia: [[]],
      motivacao: [[]],
      areasAfetadas: [[]],

      possuiIPTU: [''],
      numeroDeMoradias: [null],
      numeroDeComodos: [null],
      numeroDePavimentos: [null],
      possuiUnidadeFamiliar: [false],
      numeroDeDeficientes: [null],
      numeroDeCriancas: [null],
      numeroDeAdultos: [null],
      numeroDeIdosos: [null],

      latitude: [null],
      longitude: [null],
    });
  }

  buscarCEP() {
    const cep = this.form.get('enderecoCEP')?.value;
    if (cep && cep.length === 8) {
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

  async carregarDados(id: string) {
    const status = await Network.getStatus();

    if (status.connected) {
      this.ocorrenciaService.obterDetalhesPorId(id).subscribe({
        next: (data: any) => this.preencherFormulario(data),
        error: () => this.navCtrl.navigateBack(this.hrefVoltar),
      });
      this.carregarAnexos(id);
    } else {
      const dadosLocais = await this.ocorrenciaService.obterDetalhesLocal(id);

      if (dadosLocais) {
        this.preencherFormulario(dadosLocais);
        if (dadosLocais.anexos) {
          this.anexosExistentes = dadosLocais.anexos;
        }

        this.toastService.showToast(
          'Modo Offline: Editando dados locais.',
          'warning',
          'top',
        );
      } else {
        this.toastService.showToast(
          'Ocorrência não encontrada localmente.',
          'danger',
          'top',
        );
        this.navCtrl.navigateBack(this.hrefVoltar);
      }
    }
  }

  private preencherFormulario(data: any) {
    const mapeamentoDatas = [
      {
        campoOrigem: 'dataEHoraDoOcorrido',
        campoData: 'dataDoOcorrido',
        campoHora: 'horaDoOcorrido',
      },
      {
        campoOrigem: 'dataEHoraInicioAtendimento',
        campoData: 'dataInicioAtendimento',
        campoHora: 'horaInicioAtendimento',
      },
      {
        campoOrigem: 'dataEHoraTerminoAtendimento',
        campoData: 'dataTerminoAtendimento',
        campoHora: 'horaTerminoAtendimento',
      },
    ];

    mapeamentoDatas.forEach((map) => {
      if (data[map.campoOrigem]) {
        try {
          const dateObj = parseISO(data[map.campoOrigem]);
          data[map.campoData] = format(dateObj, 'dd/MM/yyyy');
          data[map.campoHora] = format(dateObj, 'HH:mm');
        } catch (e) {
          // Fallback se falhar o parse
        }
      }
    });

    this.form.patchValue(data);
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

  async tirarFoto() {
    try {
      let lat = undefined;
      let lng = undefined;
      try {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      } catch (e) {
        console.warn('Não foi possível obter GPS para a foto', e);
        this.toastService.showToast(
          'Não foi possível obter GPS para a foto',
          'warning',
          'top',
        );
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      if (image.webPath) {
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        const fileName = `foto_${new Date().getTime()}.${image.format}`;
        const file = new File([blob], fileName, { type: blob.type });

        this.novosAnexos.push({
          file: file,
          nome: fileName,
          tamanho: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          latitudeCaptura: lat?.toString(),
          longitudeCaptura: lng?.toString(),
          dataHoraCaptura: new Date(),
        });

        this.toastService.showToast(
          'Foto anexada com sucesso!',
          'success',
          'top',
        );
      }
    } catch (error) {
      console.error('Erro ao tirar foto', error);
    }
  }

  async capturarLocalizacaoAtual() {
    this.loadingService.show();
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
      });

      this.form.patchValue({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      this.toastService.showToast(
        'Localização capturada do GPS.',
        'success',
        'top',
      );
    } catch (error) {
      this.toastService.showToast(
        'Erro ao obter GPS. Verifique as permissões.',
        'danger',
        'top',
      );
    } finally {
      this.loadingService.hide();
    }
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file: any) => {
        this.novosAnexos.push({
          file: file,
          nome: file.name,
          tamanho: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        });
      });
    }
    event.target.value = '';
  }

  removerNovoAnexo(index: number) {
    this.novosAnexos.splice(index, 1);
  }

  marcarParaRemocao(anexo: any) {
    this.idsParaRemover.push(anexo.id);
    this.anexosExistentes = this.anexosExistentes.filter(
      (a) => a.id !== anexo.id,
    );
  }

  async salvar() {
    console.log('Iniciando processo de salvamento...');
    if (this.form.invalid) {
      console.warn('Formulário inválido!', this.form.value);
      this.form.markAllAsTouched();
      return;
    }

    this.loadingService.show();

    try {
      const dto = this.criarDTO();
      const status = await Network.getStatus();
      debugger;

      if (!status.connected) {
        await this.processarSalvamentoOffline(dto);
      } else {
        await this.processarSalvamentoOnline(dto);
      }

      this.navCtrl.back();
    } catch (error: any) {
      this.exibirErro(error);
    } finally {
      this.loadingService.hide();
    }
  }

  private criarDTO() {
    const values = this.form.value;

    return {
      ...values,
      dataEHoraDoOcorrido: this.juntarEConverterParaUTC(
        values.dataDoOcorrido,
        values.horaDoOcorrido,
      ),
      dataEHoraInicioAtendimento: this.juntarEConverterParaUTC(
        values.dataInicioAtendimento,
        values.horaInicioAtendimento,
      ),
      dataEHoraTerminoAtendimento: this.juntarEConverterParaUTC(
        values.dataTerminoAtendimento,
        values.horaTerminoAtendimento,
      ),

      // Removemos os campos virtuais do formulário para não poluir o DTO
      dataDoOcorrido: undefined,
      horaDoOcorrido: undefined,
      dataInicioAtendimento: undefined,
      horaInicioAtendimento: undefined,
      dataTerminoAtendimento: undefined,
      horaTerminoAtendimento: undefined,
    };
  }

  private juntarEConverterParaUTC(
    dataStr: string | null,
    horaStr: string | null,
  ): string | null {
    if (!dataStr || dataStr.length < 10) return null;

    // Se a data existir mas a hora não, assume 00:00
    const hora = horaStr && horaStr.length === 5 ? horaStr : '00:00';
    const dataHoraCombinada = `${dataStr} ${hora}`;

    try {
      const dataObj = parse(dataHoraCombinada, 'dd/MM/yyyy HH:mm', new Date());
      if (isNaN(dataObj.getTime())) return null;
      return dataObj.toISOString();
    } catch {
      return null;
    }
  }

  private async processarSalvamentoOffline(dto: any) {
    console.log('Sem internet. Salvando alteração local...');

    const anexosOffline = await Promise.all(
      this.novosAnexos.map(async (anexo) => ({
        nome: anexo.nome,
        tamanho: anexo.tamanho,
        base64: await this.anexoService.fileToBase64(anexo.file),
      })),
    );

    const tempId =
      this.isEditing && this.ocorrenciaId
        ? this.ocorrenciaId
        : Date.now().toString();

    const itemOffline = {
      tempId: tempId,
      isUpdate: this.isEditing,
      dto: dto,
      quadroId: this.quadroIdOrigem,
      novosAnexos: anexosOffline,
      idsAnexosRemover: this.idsParaRemover,
      dataCriacao: new Date(),
    };

    await this.ocorrenciaService.adicionarNaFila(itemOffline);

    await this.toastService.showToast(
      this.isEditing
        ? 'Alterações salvas localmente (Pendente de Envio).'
        : 'Nova ocorrência salva offline.',
      'warning',
      'top',
    );
  }

  private async processarSalvamentoOnline(dto: any) {
    if (this.isEditing && this.ocorrenciaId) {
      await lastValueFrom(
        this.ocorrenciaService.atualizar(this.ocorrenciaId, dto),
      );
    } else {
      const novaOcorrencia = await lastValueFrom(
        this.ocorrenciaService.created(dto, this.quadroIdOrigem || ''),
      );
      this.ocorrenciaId = novaOcorrencia?.id ?? null;
    }

    if (!this.ocorrenciaId)
      throw new Error('ID da ocorrência não identificado.');

    const tasks = [];

    if (this.idsParaRemover.length > 0) {
      tasks.push(
        lastValueFrom(
          this.anexoService.removerAnexos(
            this.ocorrenciaId,
            this.idsParaRemover,
          ),
        ),
      );
    }

    if (this.novosAnexos.length > 0) {
      tasks.push(
        lastValueFrom(
          this.anexoService.uploadAnexos(this.ocorrenciaId, this.novosAnexos),
        ),
      );
    }

    if (tasks.length > 0) {
      await Promise.all(tasks);
    }

    const acao = this.isEditing ? 'editada' : 'criada';

    this.toastService.showToast(
      `Ocorrência ${acao} com sucesso`,
      'success',
      'top',
    );
  }

  async exibirErro(error: any) {
    console.error(error);
    await this.toastService.showToast(
      error.message || 'Erro ao processar solicitação',
      'danger',
      'bottom',
    );
  }

  voltar() {
    this.navCtrl.navigateBack(['/home/quadro']);
  }

  async abrirHistorico() {
    if (!this.ocorrenciaId) return;

    const modal = await this.modalCtrl.create({
      component: HistoricoOcorrenciaComponent,
      componentProps: { ocorrenciaId: this.ocorrenciaId },
    });
    await modal.present();
  }

  formatarLabel(val: string): string {
    return val.replace(/([A-Z])/g, ' $1').trim();
  }

  private converterParaUTC(valorData: string | null): string | null {
    if (!valorData || valorData.length < 16) return null;
    try {
      const dataObj = parse(valorData, 'dd/MM/yyyy HH:mm', new Date());
      if (isNaN(dataObj.getTime())) return null;
      return dataObj.toISOString();
    } catch {
      return null;
    }
  }
}
