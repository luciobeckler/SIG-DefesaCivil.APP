import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenu,
  IonMenuButton,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonRouterOutlet,
  IonFooter,
  IonLabel,
  IonNote,
  IonCardContent,
  IonCard,
} from '@ionic/angular/standalone';
import { firstValueFrom, Subject, Subscription } from 'rxjs';
import { Network } from '@capacitor/network';

// Imports do Projeto
import { EPermission } from 'src/app/auth/permissions.enum';
import { HasPermissionDirective } from 'src/app/directives/has-permission.directive';
import { ISideNav } from 'src/app/interfaces/side-nav/ISideNavOptions';
import { AnexoService } from 'src/app/services/anexo.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';
import { OcorrenciaService } from 'src/app/services/ocorrencia.service';
import { QuadrosService } from 'src/app/services/quadros.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  standalone: true,
  imports: [
    IonCard,
    IonCardContent,
    CommonModule,
    RouterLink,
    RouterLinkActive,
    HasPermissionDirective,
    IonLabel,
    IonFooter,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonMenu,
    IonMenuButton,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonRouterOutlet,
    IonNote,
  ],
})
export class SideNavComponent implements OnInit, OnDestroy {
  // --- Estado ---
  quadros: any[] = [];
  itemsPendentes: any[] = [];
  private subscriptions = new Subscription();

  // --- Configuração Menu ---
  readonly sideNavObject: ISideNav = {
    icon: 'shield-half-outline',
    title: 'Defesa Civil',
    subTitle: 'Gerenciamento',
    sections: [
      {
        title: 'Principal',
        sideNavOptions: [
          {
            icon: 'document-text-outline',
            title: 'Eventos',
            path: '/home/quadro',
          },
          {
            icon: 'people-outline',
            title: 'Usuários',
            path: '/home/usuarios',
            permission: EPermission.USUARIOS_GERENCIAR,
          },
          {
            icon: 'pricetags-outline',
            title: 'Naturezas',
            path: '/home/naturezas',
            permission: EPermission.NATUREZAS_GERENCIAR,
          },
        ],
      },
    ],
  };

  // --- Injeções ---
  private ocorrenciaService = inject(OcorrenciaService);
  private anexoService = inject(AnexoService);
  private loadingService = inject(LoadingService);
  private authService = inject(AuthService);
  private storageService = inject(StorageService);
  private quadroService = inject(QuadrosService);
  private toastService = inject(ToastService);

  // --- Ciclo de Vida ---

  async ngOnInit() {
    await this.carregarQuadrosCacheOuRede();
    await this.atualizarListaPendencias();

    const sub = this.ocorrenciaService.offlineStackChanged.subscribe(() => {
      this.atualizarListaPendencias();
    });
    this.subscriptions.add(sub);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // --- Carregamento de Dados ---

  async carregarQuadrosCacheOuRede() {
    this.quadros = await this.storageService.get('quadros');

    if (!this.quadros) {
      const status = await Network.getStatus();
      if (status.connected) {
        try {
          this.quadros = await firstValueFrom(this.quadroService.getQuadros());
          await this.storageService.set('quadros', this.quadros);
        } catch (error) {
          console.error('Falha ao buscar quadros iniciais', error);
        }
      }
    }
  }

  async atualizarListaPendencias() {
    this.itemsPendentes = await this.ocorrenciaService.getFilaOffline();
  }

  async iniciarSincronizacao() {
    // 1. Validações Iniciais
    if (this.itemsPendentes.length === 0) return;
    if (!(await this.verificarConexao())) return;

    // 2. Seleção de Destino (UI)

    // 3. Processamento
    this.loadingService.show();
    const { itensFalha } = await this.processarFilaDeEnvio();

    // 4. Finalização
    await this.atualizarEstadoAposSync(itensFalha);
    this.loadingService.hide();
    this.exibirFeedbackFinal(itensFalha.length);
  }

  // --- Métodos Auxiliares de Lógica (Private) ---

  private async verificarConexao(): Promise<boolean> {
    const status = await Network.getStatus();
    if (!status.connected) {
      this.toastService.showToast('Você está sem internet.', 'warning', 'top');
      return false;
    }
    return true;
  }
  /**
   * Itera sobre a fila e tenta enviar um por um.
   * Retorna os itens que falharam.
   */
  private async processarFilaDeEnvio() {
    const itensFalha = [];

    for (const item of this.itemsPendentes) {
      try {
        const idOcorrencia = await this.enviarOcorrencia(item);

        if (item.novosAnexos?.length > 0 && idOcorrencia) {
          await this.enviarAnexos(idOcorrencia, item.novosAnexos);
        }
      } catch (error) {
        console.error('Erro sync item:', item, error);
        itensFalha.push(item);
      }
    }

    return { itensFalha };
  }

  private async enviarOcorrencia(item: any): Promise<string> {
    if (item.isUpdate) {
      // Edição: Usa o ID real (tempId armazenava o ID real na edição)
      await firstValueFrom(
        this.ocorrenciaService.atualizar(item.tempId, item.dto),
      );
      if (item.idsAnexosRemover && item.idsAnexosRemover.length > 0) {
        await firstValueFrom(
          this.anexoService.removerAnexos(item.tempId, item.idsAnexosRemover),
        );
      }
      console.log(`Atualizado: ${item.tempId}`);
      return item.tempId;
    } else {
      // Criação: Usa o Quadro Selecionado
      const nova = await firstValueFrom(
        this.ocorrenciaService.created(item.dto, item.quadroId),
      );
      return nova.id;
    }
  }

  private async enviarAnexos(ocorrenciaId: string, anexos: any[]) {
    const arquivosPreparados = anexos.map((a: any) => ({
      file: this.anexoService.base64ToFile(a.base64, a.nome),
      nome: a.nome,
      tamanho: a.tamanho,
    }));

    await firstValueFrom(
      this.anexoService.uploadAnexos(ocorrenciaId, arquivosPreparados),
    );
  }

  private async atualizarEstadoAposSync(itensFalha: any[]) {
    await this.storageService.set('fila_ocorrencias', itensFalha);
    this.itemsPendentes = itensFalha;
  }

  // --- Métodos Auxiliares de UI (Private) ---

  private exibirFeedbackFinal(qtdFalhas: number) {
    if (qtdFalhas > 0) {
      this.toastService.showToast(
        `Sincronização parcial. ${qtdFalhas} falharam.`,
        'warning',
        'bottom',
      );
    } else {
      this.toastService.showToast(
        'Sincronização concluída com sucesso!',
        'success',
        'bottom',
      );
    }
  }

  logOut() {
    this.authService.logOut().subscribe();
  }
}
