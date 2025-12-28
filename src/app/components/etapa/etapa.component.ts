import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { OcorrenciaComponent } from '../ocorrencia/ocorrencia.component';

// CDK
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

// Interfaces e Services
import { IEtapa } from 'src/app/interfaces/ocorrencias/IEtapa';
import { OcorrenciaService } from 'src/app/services/ocorrencia.service';
import { LoadingService } from 'src/app/services/loading.service';
import { IOcorrenciaPreviewDTO } from 'src/app/interfaces/ocorrencias/IOcorrencias';

@Component({
  selector: 'app-etapa',
  templateUrl: './etapa.component.html',
  styleUrls: ['./etapa.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, OcorrenciaComponent, DragDropModule],
})
export class EtapaComponent {
  etapa = input.required<IEtapa>();

  constructor(
    private ocorrenciaService: OcorrenciaService,
    private loadingService: LoadingService,
    private toastController: ToastController
  ) {}

  async drop(event: CdkDragDrop<IOcorrenciaPreviewDTO[]>) {
    if (event.previousContainer === event.container) {
      // Reordenar na mesma lista (apenas visual por enquanto)
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      // 1. Movimento Visual Imediato (Otimista)
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Dados para a requisição
      const ocorrencia = event.container.data[event.currentIndex];
      const etapaAnteriorId = event.previousContainer.id; // ID vindo do [id] do cdkDropList
      const etapaDestinoId = this.etapa().id; // ID desta etapa atual

      // 2. Chama a API com Tratativa de Erro/Rollback
      await this.processarTransicaoAPI(
        ocorrencia,
        etapaAnteriorId,
        etapaDestinoId,
        event // Passamos o evento original para poder fazer o rollback
      );
    }
  }

  private async processarTransicaoAPI(
    ocorrencia: IOcorrenciaPreviewDTO,
    etapaAnteriorId: string,
    etapaDestinoId: string,
    eventOriginal: CdkDragDrop<IOcorrenciaPreviewDTO[]>
  ) {
    // Bloqueia a UI
    await this.loadingService.show();

    this.ocorrenciaService
      .transicionarOcorrencia(ocorrencia.id, etapaAnteriorId, etapaDestinoId)
      .subscribe({
        next: async () => {
          // Sucesso: Apenas remove o loading, o visual já está certo.
          await this.loadingService.hide();
          this.presentToast('Ocorrência movida com sucesso!', 'success');
        },
        error: async (err) => {
          await this.loadingService.hide();
          console.error('Erro na transição:', err);

          const msgErro = err.error?.message || 'Erro ao mover ocorrência.';
          this.presentToast(`Falha: ${msgErro}`, 'danger');

          // ROLLBACK: Move o item de volta para a lista de origem
          this.realizarRollback(eventOriginal);
        },
      });
  }

  private realizarRollback(event: CdkDragDrop<IOcorrenciaPreviewDTO[]>) {
    // Invertemos a lógica: movemos do container ATUAL (destino falho) para o ANTERIOR (origem)
    // Note que usamos 'currentIndex' como origem e 'previousIndex' como destino agora.
    transferArrayItem(
      event.container.data, // De onde está agora (Destino errado)
      event.previousContainer.data, // Para onde vai voltar (Origem)
      event.currentIndex, // Índice atual
      event.previousIndex // Índice original
    );
  }

  private async presentToast(
    message: string,
    color: 'success' | 'danger' | 'warning'
  ) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
      icon: color === 'danger' ? 'alert-circle' : 'checkmark-circle',
    });
    await toast.present();
  }
}
