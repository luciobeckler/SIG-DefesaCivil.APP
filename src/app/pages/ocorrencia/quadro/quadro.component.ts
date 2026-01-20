import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IEtapa } from 'src/app/interfaces/ocorrencias/IEtapa';
import { IQuadroDetalhes } from 'src/app/interfaces/ocorrencias/IQuadro';
import { QuadrosService } from 'src/app/services/quadros.service';
import { addIcons } from 'ionicons';
import {
  chevronDown,
  chevronUp,
  addCircleOutline,
  filterOutline,
  trashOutline,
} from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { NavController, MenuController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { EtapaComponent } from 'src/app/components/etapa/etapa.component';
import {
  IonMenu,
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
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-quadro',
  templateUrl: './quadro.component.html',
  styleUrls: ['./quadro.component.scss'],
  imports: [
    IonMenu,
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
    CommonModule,
    FormsModule,
    EtapaComponent,
  ],
  standalone: true,
})
export class QuadroComponent implements OnInit {
  etapas: IEtapa[] = [];
  etapasOriginais: IEtapa[] = [];
  public quadroId: string = '';

  // Filtros agora armazenam string pura: "DD/MM/AAAA"
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
    private menuCtrl: MenuController,
  ) {
    addIcons({
      chevronDown,
      chevronUp,
      addCircleOutline,
      filterOutline,
      trashOutline,
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

  ionViewWillEnter() {
    this.menuCtrl.enable(true, 'menu-filtros');
  }

  ionViewWillLeave() {
    this.menuCtrl.close('menu-filtros');
    this.menuCtrl.enable(false, 'menu-filtros');
  }

  async abrirMenuFiltros() {
    await this.menuCtrl.enable(true, 'menu-filtros');
    await this.menuCtrl.open('menu-filtros');
  }

  getEtapasFromQuadroId() {
    this.quadroService.obterPorId(this.quadroId).subscribe({
      next: (data: IQuadroDetalhes) => {
        this.etapasOriginais = JSON.parse(JSON.stringify(data.etapas));
        this.etapas = data.etapas;
      },
      error: (err) => console.error('Erro ao buscar detalhes', err),
    });
  }

  // --- LÓGICA DE MÁSCARA MANUAL (DD/MM/AAAA) ---
  formatarDataInput(event: any, campo: 'dataInicio' | 'dataFim') {
    let valor = event.target.value.replace(/\D/g, ''); // Remove tudo que não é número

    if (valor.length > 8) {
      valor = valor.substring(0, 8); // Limita a 8 números
    }

    // Adiciona as barras
    if (valor.length > 4) {
      valor = valor.replace(/^(\d{2})(\d{2})(\d)/, '$1/$2/$3');
    } else if (valor.length > 2) {
      valor = valor.replace(/^(\d{2})(\d)/, '$1/$2');
    }

    // Atualiza o model
    this.filtros[campo] = valor;
  }

  // Helper para converter "25/12/2023" -> "2023-12-25"
  private converterParaISO(dataBR: string): string | null {
    if (!dataBR || dataBR.length !== 10) return null;

    const partes = dataBR.split('/');
    if (partes.length !== 3) return null;

    const dia = partes[0];
    const mes = partes[1];
    const ano = partes[2];

    return `${ano}-${mes}-${dia}`;
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
      this.menuCtrl.close('menu-filtros');
      return;
    }

    // 2. Prepara termos de busca
    const termoProtocolo = this.filtros.protocolo.toLowerCase();
    const termoRua = this.filtros.rua.toLowerCase();
    const termoBairro = this.filtros.bairro.toLowerCase();
    const termoSolicitante = this.filtros.solicitante.toLowerCase();

    // 3. Converte as datas de texto para ISO (YYYY-MM-DD) para comparação
    const dataInicioISO = this.converterParaISO(this.filtros.dataInicio);
    const dataFimISO = this.converterParaISO(this.filtros.dataFim);

    // 4. Executa o Filtro
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
            // Pega apenas a parte YYYY-MM-DD da ocorrência
            const dataOcorrencia = oc.dataEHoraDoOcorrido.split('T')[0];

            if (dataInicioISO && dataOcorrencia < dataInicioISO) {
              matchData = false;
            }
            if (dataFimISO && dataOcorrencia > dataFimISO) {
              matchData = false;
            }
          } else if (dataInicioISO || dataFimISO) {
            // Se tem filtro de data mas a ocorrência não tem data -> oculta
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

    this.menuCtrl.close('menu-filtros');
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
  }

  novaOcorrencia() {
    this.navCtrl.navigateForward(['/home', 'ocorrencia', 'form', 'nova'], {
      queryParams: { quadroId: this.quadroId },
    });
  }
}
