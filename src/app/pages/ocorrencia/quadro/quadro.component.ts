import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  chevronDown,
  chevronUp,
  addCircleOutline,
  filterOutline,
  trashOutline,
  closeOutline, // Ícone para fechar o modal
} from 'ionicons/icons';

// Interfaces e Services
import { IEtapa } from 'src/app/interfaces/ocorrencias/IEtapa';
import { IQuadroDetalhes } from 'src/app/interfaces/ocorrencias/IQuadro';
import { QuadrosService } from 'src/app/services/quadros.service';

// Componentes Filhos
import { EtapaComponent } from 'src/app/components/etapa/etapa.component';

// Ionic Standalone Imports
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonListHeader,
  IonLabel,
  IonList,
  IonItem,
  IonInput,
  IonButtons,
  IonModal, // Importante: IonModal adicionado
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-quadro',
  templateUrl: './quadro.component.html',
  styleUrls: ['./quadro.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EtapaComponent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonListHeader,
    IonLabel,
    IonList,
    IonItem,
    IonInput,
    IonButtons,
    IonModal, // Adicionado
  ],
})
export class QuadroComponent implements OnInit {
  etapas: IEtapa[] = [];
  etapasOriginais: IEtapa[] = [];
  public quadroId: string = '';

  // Controle do Modal
  public isModalOpen = false;

  filtros = {
    protocolo: '',
    rua: '',
    bairro: '',
    solicitante: '',
    dataInicio: '',
    dataFim: '',
  };

  constructor(
    private navCtrl: NavController,
    private quadroService: QuadrosService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {
    addIcons({
      chevronDown,
      chevronUp,
      addCircleOutline,
      filterOutline,
      trashOutline,
      closeOutline,
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.quadroId = params.get('id') ?? '';
      if (this.quadroId && this.quadroId !== 'null') {
        this.getEtapasFromQuadroId();
      }
    });
  }

  // --- CONTROLE DO MODAL ---
  setModalOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  // --- LÓGICA DE DADOS ---
  getEtapasFromQuadroId() {
    this.quadroService.obterPorId(this.quadroId).subscribe({
      next: (data: IQuadroDetalhes) => {
        // Deep copy para preservar os originais
        this.etapasOriginais = JSON.parse(JSON.stringify(data.etapas));
        this.etapas = data.etapas;

        this.aplicarFiltros();
      },
      error: (err) => console.error('Erro ao buscar detalhes', err),
    });
  }

  // --- LÓGICA DE MÁSCARA MANUAL (DD/MM/AAAA) ---
  formatarDataInput(event: any, campo: 'dataInicio' | 'dataFim') {
    let valor = event.target.value.replace(/\D/g, '');

    if (valor.length > 8) {
      valor = valor.substring(0, 8);
    }

    if (valor.length > 4) {
      valor = valor.replace(/^(\d{2})(\d{2})(\d)/, '$1/$2/$3');
    } else if (valor.length > 2) {
      valor = valor.replace(/^(\d{2})(\d)/, '$1/$2');
    }

    this.filtros[campo] = valor;
  }

  // --- FILTROS ---
  private converterParaISO(dataBR: string): string | null {
    if (!dataBR || dataBR.length !== 10) return null;
    const partes = dataBR.split('/');
    if (partes.length !== 3) return null;
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  }

  aplicarFiltros() {
    // 1. Verifica se está tudo vazio
    if (
      !this.filtros.protocolo &&
      !this.filtros.rua &&
      !this.filtros.bairro &&
      !this.filtros.solicitante &&
      !this.filtros.dataInicio &&
      !this.filtros.dataFim
    ) {
      this.etapas = JSON.parse(JSON.stringify(this.etapasOriginais));
      this.setModalOpen(false); // Fecha o modal
      return;
    }

    // 2. Prepara termos de busca
    const termoProtocolo = this.filtros.protocolo.toLowerCase();
    const termoRua = this.filtros.rua.toLowerCase();
    const termoBairro = this.filtros.bairro.toLowerCase();
    const termoSolicitante = this.filtros.solicitante.toLowerCase();
    const dataInicioISO = this.converterParaISO(this.filtros.dataInicio);
    const dataFimISO = this.converterParaISO(this.filtros.dataFim);

    // 3. Executa o Filtro
    this.etapas = this.etapasOriginais.map((etapa) => {
      const etapaCopia = { ...etapa };

      if (etapaCopia.ocorrencias) {
        etapaCopia.ocorrencias = etapaCopia.ocorrencias.filter((oc) => {
          // Filtros de Texto
          const matchProtocolo =
            !termoProtocolo ||
            (oc.numero && oc.numero.toString().includes(termoProtocolo));
          const matchRua =
            !termoRua ||
            (oc.enderecoResumido &&
              oc.enderecoResumido.toLowerCase().includes(termoRua));
          const matchBairro =
            !termoBairro ||
            (oc.enderecoResumido &&
              oc.enderecoResumido.toLowerCase().includes(termoBairro));
          const matchSolicitante =
            !termoSolicitante ||
            (oc.solicitanteNome &&
              oc.solicitanteNome.toLowerCase().includes(termoSolicitante));

          // Filtro de Data
          let matchData = true;
          if (oc.dataEHoraDoOcorrido) {
            const dataOcorrencia = oc.dataEHoraDoOcorrido.split('T')[0];
            if (dataInicioISO && dataOcorrencia < dataInicioISO)
              matchData = false;
            if (dataFimISO && dataOcorrencia > dataFimISO) matchData = false;
          } else if (dataInicioISO || dataFimISO) {
            matchData = false;
          }

          return (
            matchProtocolo &&
            matchRua &&
            matchBairro &&
            matchSolicitante &&
            matchData
          );
        });
      }
      return etapaCopia;
    });

    this.setModalOpen(false); // Fecha o modal após filtrar
  }

  limparFiltros() {
    this.filtros = {
      protocolo: '',
      rua: '',
      bairro: '',
      solicitante: '',
      dataInicio: '',
      dataFim: '',
    };
    this.etapas = JSON.parse(JSON.stringify(this.etapasOriginais));

    this.setModalOpen(false);
  }

  novaOcorrencia() {
    this.setModalOpen(false);
    this.cdr.detectChanges();
    this.navCtrl.navigateForward(['/home', 'ocorrencia', 'form', 'nova'], {
      queryParams: { quadroId: this.quadroId },
    });
  }
}
