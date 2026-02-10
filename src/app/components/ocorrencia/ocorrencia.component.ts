import { CommonModule } from '@angular/common';
import { Component, computed, Inject, inject, input } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { IOcorrenciaPreviewDTO } from 'src/app/interfaces/ocorrencias/IOcorrencias';
import {
  getVisual,
  GrauRiscoVisual,
  TipoRiscoVisual,
  IVisualConfig,
} from 'src/app/helper/VisualIconHelper';
import { formatarLabel } from 'src/app/helper/funcions';
import { RouterModule } from '@angular/router';
import {
  IonCard,
  IonCardContent,
  IonIcon,
  IonText,
  IonNote,
  IonChip,
  IonLabel,
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { PermissionService } from 'src/app/services/permission.service';
import { ToastController } from '@ionic/angular/standalone';
import { EPermission } from 'src/app/auth/permissions.enum';

@Component({
  selector: 'app-ocorrencia',
  templateUrl: './ocorrencia.component.html',
  styleUrls: ['./ocorrencia.component.scss'],
  imports: [
    IonCard,
    IonCardContent,
    IonIcon,
    IonText,
    IonNote,
    IonChip,
    IonLabel,
    CommonModule,
    RouterModule,
  ],
  standalone: true,
})
export class OcorrenciaComponent {
  ocorrencia = input.required<IOcorrenciaPreviewDTO>();
  quadroId = input.required<string>();

  private navCtrl = inject(NavController);
  private authService = inject(AuthService);
  private permService = inject(PermissionService);
  private toastCtrl = inject(ToastController);

  protected readonly formatarLabel = formatarLabel;
  perms = EPermission;

  getRua(endereco: string | null): string {
    if (!endereco) return 'Local não informado';
    return endereco.split(',')[0];
  }

  getBairro(endereco: string | null): string {
    if (!endereco) return '';
    const partes = endereco.split(',');
    return partes.length > 1 ? partes.slice(1).join(',').trim() : '';
  }

  getIniciais(email: string | null): string {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  }

  getGrauVisual(grau: string | null): IVisualConfig {
    return getVisual(GrauRiscoVisual, grau);
  }

  getTipoVisual(tipo: string): IVisualConfig {
    return getVisual(TipoRiscoVisual, tipo);
  }

  // --- AÇÃO DE NAVEGAR ---
  async navegar() {
    debugger;
    if (this.canAccess()) {
      this.navCtrl.navigateForward(
        ['/home', 'ocorrencia', 'form', this.ocorrencia().id],
        {
          queryParams: { quadroId: this.quadroId() },
        },
      );
    } else {
      const toast = await this.toastCtrl.create({
        message: 'Você não tem permissão para visualizar esta ocorrência.',
        duration: 2000,
        color: 'warning',
        icon: 'lock-closed',
      });
      toast.present();
    }
  }

  canAccess = computed(() => {
    const dadosOcorrencia = this.ocorrencia();
    const userId = this.authService.getUserId();

    const temPermissaoGlobal = this.permService.hasPermission(
      this.perms.OCORRENCIA_VISUALIZAR_TODAS,
    );

    const ehDono = dadosOcorrencia.usuarioCriadorId === userId;

    return temPermissaoGlobal || ehDono;
  });
}
