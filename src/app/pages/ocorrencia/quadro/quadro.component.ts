import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { firstValueFrom, Subscription } from 'rxjs';
import { converterParaISO } from 'src/app/helper/funcions';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Network } from '@capacitor/network';
import { OcorrenciaService } from 'src/app/services/ocorrencia.service';

@Component({
  selector: 'app-quadro',
  templateUrl: './quadro.component.html',
  styleUrls: ['./quadro.component.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRefresher,
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
    IonRefresher,
  ],
})
export class QuadroComponent {
  private navCtrl = inject(NavController);
  private quadroService = inject(QuadrosService);
  private cdr = inject(ChangeDetectorRef);
  private ocorrenciaService = inject(OcorrenciaService);
  private storageService = inject(StorageService);

  private subscriptions = new Subscription();

  quadros: IQuadro[] = [];
  quadrosOriginais: IQuadro[] = [];
  public quadroAtual?: IQuadro;
  public isModalOpen = false;

  filtros = {
    protocolo: '',
    rua: '',
    bairro: '',
    solicitante: '',
    dataInicio: '',
    dataFim: '',
  };

  constructor() {
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

  async ionViewWillEnter() {
    console.log('Página de quadros ativa. Atualizando dados...');
    await this.loadData();

    const sub = this.ocorrenciaService.createdOrUpdated.subscribe(() => {
      this.loadData();
    });
    this.subscriptions.add(sub);
  }

  async loadData() {
    const status = await Network.getStatus();

    const cache = await this.quadroService.getQuadrosOffline();
    if (cache.length > 0) {
      this.quadros = cache;
      this.quadroAtual = this.quadroAtual || this.quadros[0];
    }

    if (status.connected) {
      await this.carregarQuadros();
    }

    this.cdr.detectChanges();
  }

  // Transformamos em Promise para o await do loadData funcionar
  async carregarQuadros() {
    const data = await firstValueFrom(this.quadroService.getQuadros());
    console.log(this.storageService.get('quadros_cache'));
    if (data && data.length > 0) {
      this.quadrosOriginais = JSON.parse(JSON.stringify(data));
      this.quadros = JSON.parse(JSON.stringify(data));

      if (
        !this.quadroAtual ||
        !this.quadros.find((q) => q.id === this.quadroAtual!.id)
      ) {
        this.quadroAtual = this.quadros[0];
      } else {
        this.quadroAtual = this.quadros.find(
          (q) => q.id === this.quadroAtual!.id,
        );
      }
    }
  }

  async handleRefresh(event: any) {
    await this.loadData();
    event.target.complete();
  }

  async trocarQuadro(event: any) {
    const idSelecionado = event.detail.value;

    // 1. Busca pelo ID corretamente
    const novoQuadro = this.quadros.find((q) => q.id === idSelecionado);

    if (novoQuadro) {
      this.quadroAtual = novoQuadro;

      // 2. Reseta filtros visuais ao trocar de quadro para evitar confusão
      this.limparFiltros(); // false para não fechar modal se não quiser

      this.cdr.detectChanges();
    }
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

  aplicarFiltros() {
    if (
      !this.filtros.protocolo &&
      !this.filtros.rua &&
      !this.filtros.bairro &&
      !this.filtros.solicitante &&
      !this.filtros.dataInicio &&
      !this.filtros.dataFim
    ) {
      this.setModalOpen(false);
      return;
    }

    const quadroOriginal = this.quadrosOriginais.find(
      (q) => q.id === this.quadroAtual!.id,
    );
    if (quadroOriginal) {
      // Restaura as etapas originais antes de aplicar o filtro
      this.quadroAtual!.etapas = JSON.parse(
        JSON.stringify(quadroOriginal.etapas),
      );
    }

    // 2. Prepara termos de busca
    const termoProtocolo = this.filtros.protocolo.toLowerCase();
    const termoRua = this.filtros.rua.toLowerCase();
    const termoBairro = this.filtros.bairro.toLowerCase();
    const termoSolicitante = this.filtros.solicitante.toLowerCase();
    const dataInicioISO = converterParaISO(this.filtros.dataInicio);
    const dataFimISO = converterParaISO(this.filtros.dataFim);

    // 3. Executa o Filtro
    this.quadroAtual!.etapas = this.quadroAtual!.etapas.map((etapa) => {
      const etapaCopia = { ...etapa };

      if (etapaCopia.ocorrencias) {
        etapaCopia.ocorrencias = etapaCopia.ocorrencias.filter((oc) => {
          // Filtros de Texto
          const matchProtocolo =
            !termoProtocolo ||
            (oc.numero && oc.numero.toString().includes(termoProtocolo));
          const matchRua = !termoRua || oc.enderecoRua;
          const matchBairro = !termoBairro || oc.enderecoBairro;
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

  limparFiltros(fecharModal = true) {
    this.filtros = {
      protocolo: '',
      rua: '',
      bairro: '',
      solicitante: '',
      dataInicio: '',
      dataFim: '',
    };

    // Restaura os dados originais sem filtros
    if (this.quadroAtual) {
      const original = this.quadrosOriginais.find(
        (q) => q.id === this.quadroAtual!.id,
      );
      if (original) {
        this.quadroAtual.etapas = JSON.parse(JSON.stringify(original.etapas));
      }
    }

    if (fecharModal) this.setModalOpen(false);
  }

  novaOcorrencia() {
    this.setModalOpen(false);
    this.cdr.detectChanges();
    this.navCtrl.navigateForward(['/home', 'ocorrencia', 'form', 'nova'], {
      queryParams: { quadroId: this.quadroAtual!.id },
    });
  }
}
