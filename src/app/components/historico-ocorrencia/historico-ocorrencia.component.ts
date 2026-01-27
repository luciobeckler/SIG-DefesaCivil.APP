import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonIcon,
  IonButtons,
  IonButton,
  ModalController,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, personCircleOutline, timeOutline } from 'ionicons/icons';
import { OcorrenciaService } from 'src/app/services/ocorrencia.service';
import { IHistoricoOcorrenciaDTO } from 'src/app/interfaces/ocorrencias/IOcorrencias';

@Component({
  selector: 'app-historico-ocorrencia',
  templateUrl: './historico-ocorrencia.component.html',
  styleUrls: ['./historico-ocorrencia.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonIcon,
    IonButtons,
    IonButton,
    IonText,
  ],
})
export class HistoricoOcorrenciaComponent implements OnInit {
  @Input() ocorrenciaId!: string; // Recebe o ID do pai

  historico: IHistoricoOcorrenciaDTO[] = [];

  private service = inject(OcorrenciaService);
  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({ close, personCircleOutline, timeOutline });
  }

  ngOnInit() {
    if (this.ocorrenciaId) {
      this.carregarHistorico();
    }
  }

  carregarHistorico() {
    this.service.obterHistorico(this.ocorrenciaId).subscribe({
      next: (data) => {
        this.historico = data;
      },
      error: () => {},
    });
  }

  fechar() {
    this.modalCtrl.dismiss();
  }
}
