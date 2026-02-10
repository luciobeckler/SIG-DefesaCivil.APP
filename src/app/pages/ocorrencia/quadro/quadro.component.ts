import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  chevronDown,
  chevronUp,
  closeOutline,
  filterOutline,
  trashOutline,
} from 'ionicons/icons';

// Interfaces e Services
import { IEtapa } from 'src/app/interfaces/ocorrencias/IEtapa';
import { IQuadro } from 'src/app/interfaces/ocorrencias/IQuadro';
import { QuadrosService } from 'src/app/services/quadros.service';

// Componentes Filhos
import { EtapaComponent } from 'src/app/components/etapa/etapa.component';

// Ionic Standalone Imports
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { StorageService } from 'src/app/services/storage/storage.service';

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
    IonText,
    IonSelect,
    IonSelectOption,
  ],
})
export class QuadroComponent implements OnInit {
  quadros: IQuadro[] = [];
  etapas: IEtapa[] = [];
  etapasOriginais: IEtapa[] = [];
  public quadroAtualId: string = '';

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
    private storageService: StorageService,
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

  setModalOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }
  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    try {
      // 1. Aguarda carregar a lista de quadros
      await this.carregarQuadros();

      // 2. Só tenta buscar etapas se houver um quadro selecionado
      if (this.quadroAtualId) {
        await this.getEtapasFromQuadroId();
      }
    } catch (error) {
      console.error('Erro na sequência de carregamento:', error);
    }
  }

  // Transformamos em Promise para o await do loadData funcionar
  async carregarQuadros() {
    const data = await firstValueFrom(this.quadroService.getAllPreview());
    if (data && data.length > 0) {
      this.quadros = data;
      if (!this.quadroAtualId) {
        this.quadroAtualId = this.quadros[0].id;
      }
    }
  }

  // Chamado quando o usuário troca o quadro no select
  async trocarQuadro(event: any) {
    this.quadroAtualId = event.detail.value;
    await this.getEtapasFromQuadroId();
  }

  async getEtapasFromQuadroId() {
    if (!this.quadroAtualId) return;

    const data = await firstValueFrom(
      this.quadroService.getDetailsById(this.quadroAtualId),
    );
    // Deep copy para preservar os originais e permitir filtros
    this.etapasOriginais = JSON.parse(JSON.stringify(data.etapas));
    this.etapas = data.etapas;
    this.aplicarFiltros();
    this.cdr.detectChanges(); // Garante que o Angular perceba a mudança
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
      queryParams: { quadroId: this.quadroAtualId },
    });
  }
}
