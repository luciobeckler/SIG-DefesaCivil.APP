// Exemplo: src/app/pages/evento/historico-modal/historico-modal.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { IEventoHistorico } from 'src/app/interfaces/eventos/IEventoHistorico';

@Component({
  selector: 'app-evento-historico-modal',
  templateUrl: './evento-historico-modal.component.html',
  styleUrls: ['./evento-historico-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class HistoricoModalComponent {
  // O Observable do histórico será passado como um 'prop' (propriedade)
  // ao criar o modal.
  @Input() historico$!: Observable<IEventoHistorico[]>;

  constructor(private modalCtrl: ModalController) {}

  // Método público para fechar o modal
  fecharModal() {
    this.modalCtrl.dismiss();
  }
}
