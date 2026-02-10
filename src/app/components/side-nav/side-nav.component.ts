import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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
import { firstValueFrom } from 'rxjs';
import { EPermission } from 'src/app/auth/permissions.enum';
import { HasPermissionDirective } from 'src/app/directives/has-permission.directive';
import { ISideNav } from 'src/app/interfaces/side-nav/ISideNavOptions';
import { AnexoService } from 'src/app/services/anexo.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';
import { OcorrenciaService } from 'src/app/services/ocorrencia.service';
import { QuadrosService } from 'src/app/services/quadros.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ToastController, AlertController } from '@ionic/angular/standalone';
import { Network } from '@capacitor/network';
import { alert } from 'ionicons/icons';

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
export class SideNavComponent implements OnInit {
  quadros: any;
  sideNavObject: ISideNav = {
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
      {
        title: 'Ações',
        sideNavOptions: [
          {
            icon: 'warning-outline',
            title: 'Chamado urgente',
            path: '/home/ocorrencia/form',
          },
        ],
      },
    ],
  };
  itensPendentesDeEnvio: any[] = [];

  private ocorrenciaService = inject(OcorrenciaService);
  private anexoService = inject(AnexoService);
  private loadingService = inject(LoadingService);
  private toastCtrl = inject(ToastController);
  private authService = inject(AuthService);
  private storageService = inject(StorageService);
  private quadroService = inject(QuadrosService);
  private alertCtrl = inject(AlertController);

  async ngOnInit() {
    await this.carregarQuadros();
    await this.verificarPendencias();
  }

  async carregarQuadros() {
    this.quadros = await this.storageService.get('quadros');
    if (this.quadros == null) {
      const status = await Network.getStatus();
      if (status.connected) {
        this.quadros = await firstValueFrom(this.quadroService.getAllPreview());
        this.storageService.set('quadros', this.quadros);
      }
    }
  }

  async verificarPendencias() {
    this.itensPendentesDeEnvio = await this.ocorrenciaService.getFilaOffline();
  }

  async sincronizarAgora() {
    // 1. Verificação de Rede
    const status = await Network.getStatus();
    if (!status.connected) {
      const t = await this.toastCtrl.create({
        message: 'Você ainda está sem internet.',
        duration: 2000,
        color: 'warning',
      });
      t.present();
      return;
    }

    if (this.itensPendentesDeEnvio.length === 0) return;

    // 2. Buscar Quadros disponíveis (Online) para o usuário selecionar
    this.loadingService.show();
    let quadrosDisponiveis = [];
    try {
      // Chama o GET atualizado do serviço
      quadrosDisponiveis = await firstValueFrom(
        this.quadroService.getAllPreview(),
      );
    } catch (error) {
      this.loadingService.hide();
      const t = await this.toastCtrl.create({
        message: 'Erro ao buscar quadros para sincronização.',
        color: 'danger',
      });
      t.present();
      return;
    }
    this.loadingService.hide(); // Esconde loading para mostrar o Alerta

    // 3. Exibir Alerta para Seleção
    const alert = await this.alertCtrl.create({
      header: 'Sincronização',
      subHeader: 'Selecione o Quadro de destino',
      message: 'Para onde as ocorrências criadas offline devem ser enviadas?',
      backdropDismiss: false, // Obriga a selecionar ou cancelar
      inputs: quadrosDisponiveis.map((q) => ({
        type: 'radio',
        label: q.nome, // Supondo que seu IQuadro tenha 'nome'
        value: q.id, // Supondo que seu IQuadro tenha 'id'
      })),
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Sincronizar',
          role: 'confirm',
        },
      ],
    });

    await alert.present();

    const { role, data } = await alert.onDidDismiss();

    if (role !== 'confirm' || !data.values) {
      // Usuário cancelou ou não selecionou nada
      return;
    }

    const quadroIdSelecionado = data.values; // O ID escolhido

    // 4. Iniciar Processo de Envio
    this.loadingService.show();

    const itensFalha = [];

    // Processa a fila
    for (const item of this.itensPendentesDeEnvio) {
      try {
        // --- ALTERAÇÃO IMPORTANTE ---
        // Usamos o quadroIdSelecionado pelo usuário, ignorando o que foi salvo offline (se houver)
        const novaOcorrencia = await firstValueFrom(
          this.ocorrenciaService.criar(item.dto, quadroIdSelecionado),
        );

        // Enviar Anexos (se houver)
        if (
          item.novosAnexos &&
          item.novosAnexos.length > 0 &&
          novaOcorrencia?.id
        ) {
          const arquivosParaUpload = item.novosAnexos.map((a: any) => ({
            file: this.anexoService.base64ToFile(a.base64, a.nome),
            nome: a.nome,
            tamanho: a.tamanho,
          }));

          await firstValueFrom(
            this.anexoService.uploadAnexos(
              novaOcorrencia.id,
              arquivosParaUpload,
            ),
          );
        }

        // Sucesso: não faz nada, pois o item não será readicionado à lista de falhas
      } catch (error) {
        console.error('Erro ao sincronizar item', item, error);
        itensFalha.push(item); // Mantém na fila se der erro
      }
    }

    // Atualiza a fila no Storage
    await this.storageService.set('fila_ocorrencias', itensFalha);
    this.itensPendentesDeEnvio = itensFalha;

    this.loadingService.hide();

    const msg =
      itensFalha.length > 0
        ? `Sincronização parcial. ${itensFalha.length} itens falharam.`
        : 'Sincronização concluída com sucesso!';

    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      color: itensFalha.length > 0 ? 'warning' : 'success',
    });
    toast.present();
  }
  logOut() {
    this.authService.logOut().subscribe();
  }
}
