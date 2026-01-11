import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

// Imports dos seus Enums e Helpers
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
import { formatarLabel } from 'src/app/helper/funcions'; // Se tiver seu helper global

@Component({
  selector: 'app-ocorrencia-form',
  templateUrl: './ocorrencia-form.component.html',
  styleUrls: ['./ocorrencia-form.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class OcorrenciaFormPage implements OnInit {
  // Injeção de Dependência
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private navCtrl = inject(NavController);
  private ocorrenciaService = inject(OcorrenciaService);
  private toastCtrl = inject(ToastController);
  private quadroIdOrigem: string | null = null;

  hrefVoltar = '/home';
  form!: FormGroup;
  isEditing = false;
  ocorrenciaId: string | null = null;
  tituloPagina = 'Nova Ocorrência';

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

  // Helper local para usar no template (caso não tenha o global)
  formatarLabel = (val: string) => val.replace(/([A-Z])/g, ' $1').trim();

  constructor() {
    this.buildForm();
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
        this.form.patchValue({
          dataEHoraDoOcorrido: new Date().toISOString(),
        });
      }
    });
  }

  buildForm() {
    this.form = this.fb.group({
      // --- Dados Básicos ---
      dataEHoraDoOcorrido: [null],
      dataEHoraInicioAtendimento: [null],
      dataEHoraTerminoAtendimento: [null],

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
        // PatchValue preenche o formulário automaticamente com as chaves que batem
        this.form.patchValue(data);
      },
      error: (err) => {
        console.error(err);
        this.mostrarToast('Erro ao carregar ocorrência', 'danger');
      },
    });
  }

  async salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // Mostra erros na tela
      return;
    }

    const dto = this.form.value;

    try {
      if (this.isEditing && this.ocorrenciaId) {
        await this.ocorrenciaService
          .atualizar(this.ocorrenciaId, dto)
          .toPromise();
        this.mostrarToast('Ocorrência atualizada com sucesso!', 'success');
      } else {
        // Você precisa passar o quadroId ou similar se sua API exigir na criação
        // await this.ocorrenciaService.criar(dto).toPromise();
        console.log('Criar (implementar service):', dto);
        this.mostrarToast('Ocorrência criada com sucesso!', 'success');
      }
      this.navCtrl.back(); // Volta para o Kanban
    } catch (error) {
      console.error(error);
      this.mostrarToast('Erro ao salvar dados.', 'danger');
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
}
