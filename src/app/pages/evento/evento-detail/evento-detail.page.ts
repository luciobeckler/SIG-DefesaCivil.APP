import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { IEventoDetalhes } from 'src/app/interfaces/eventos/IEvento';
import { EventoService } from 'src/app/services/evento.service';
import { IEventoHistorico } from 'src/app/interfaces/eventos/IEventoHistorico';
import { HistoricoModalComponent } from 'src/app/components/evento-historico-modal/evento-historico-modal.component';
import { FormatStatusPipe } from 'src/app/pipes/format-status.pipe';

@Component({
  selector: 'app-evento-detail',
  templateUrl: './evento-detail.page.html',
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule, FormatStatusPipe],
})
export class EventoDetailPage implements OnInit {
  evento$!: Observable<IEventoDetalhes>;
  eventoId!: string;
  historico$!: Observable<IEventoHistorico[]>;

  constructor(
    private route: ActivatedRoute,
    private eventoService: EventoService,
    private router: Router,
    private alertController: AlertController,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.eventoId = this.route.snapshot.paramMap.get('id')!;
    this.loadEventoEHistorico();
    console.log(this.evento$);
  }

  loadEventoEHistorico() {
    this.evento$ = this.eventoService.getEventoDetalhes(this.eventoId);
    this.historico$ = this.eventoService.getHistoricoDetalhes(this.eventoId);
  }

  async deletar(evento: IEventoDetalhes) {
    const alert = await this.alertController.create({
      header: 'Confirmação',
      message: `Tem certeza que deseja deletar o evento "${evento.titulo}"?. Esta ação tornará o evento invisível e apenas um administrador poderá recupera-lo`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Deletar',
          handler: () => {
            this.executarDelecao(evento.id);
          },
        },
      ],
    });
    await alert.present();
  }

  private executarDelecao(eventoId: string) {
    this.eventoService.deleteEvento(eventoId).subscribe({
      next: async () => {
        const alert = await this.presentAlert(
          'Sucesso',
          'O evento foi deletado com êxito.',
          ['OK']
        );
        await alert.onDidDismiss();

        this.router.navigate(['/home/evento-list']);
      },
      error: (err) => {
        const errorMessage =
          err.error?.message ||
          'Ocorreu um erro desconhecido ao deletar o evento.';

        this.presentAlert('Erro na Deleção', errorMessage, ['Entendi']);
      },
    });
  }

  async presentAlert(header: string, message: string, buttons: any[]) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons,
    });
    await alert.present();
    return alert;
  }

  async exibirHistoricoModal() {
    const modal = await this.modalCtrl.create({
      component: HistoricoModalComponent,

      componentProps: {
        historico$: this.historico$,
      },
      breakpoints: [0, 0.5, 0.75],
      initialBreakpoint: 0.75,
    });
    await modal.present();
  }
}
