import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { IOcorrenciaPreviewDTO } from 'src/app/interfaces/ocorrencias/IOcorrencias';
import {
  getVisual,
  GrauRiscoVisual,
  TipoRiscoVisual,
  IVisualConfig,
} from 'src/app/helper/VisualIconHelper';
import { formatarLabel } from 'src/app/helper/funcions';

@Component({
  selector: 'app-ocorrencia',
  templateUrl: './ocorrencia.component.html',
  styleUrls: ['./ocorrencia.component.scss'],
  imports: [IonicModule, CommonModule],
  standalone: true,
})
export class OcorrenciaComponent {
  ocorrencia = input.required<IOcorrenciaPreviewDTO>();
  protected readonly formatarLabel = formatarLabel;

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
}
