import { CommonModule } from '@angular/common';
import { Component, computed, Inject, inject, input } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
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
import { EPermission } from 'src/app/auth/permissions.enum';
import { IOcorrencia } from 'src/app/interfaces/ocorrencias/IOcorrencias';
import { ToastService } from 'src/app/services/toast/toast.service';

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
  ocorrencia = input.required<IOcorrencia>();
  quadroId = input.required<string>();

  private navCtrl = inject(NavController);
  private authService = inject(AuthService);
  private permService = inject(PermissionService);
  private toastService = inject(ToastService);

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
    if (this.canAccess()) {
      this.navCtrl.navigateForward(
        ['/home', 'ocorrencia', 'form', this.ocorrencia().id],
        {
          queryParams: { quadroId: this.quadroId() || '' },
        },
      );
    } else {
      this.toastService.showToast(
        'Você não tem permissão para visualizar esta ocorrência.',
        'warning',
        'bottom',
      );
    }
  }

  canAccess = computed(() => {
    if (!this.ocorrencia()) return;
    const dadosOcorrencia = this.ocorrencia();
    const userId = this.authService.getUserId();

    const temPermissaoGlobal = this.permService.hasPermission(
      this.perms.OCORRENCIA_VISUALIZAR_TODAS,
    );

    const ehDono = dadosOcorrencia.usuarioCriador.id === userId;

    return temPermissaoGlobal || ehDono;
  });
}
