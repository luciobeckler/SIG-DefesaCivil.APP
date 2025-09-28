import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { INatureza } from 'src/app/interfaces/naturezas/INatureza';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-natureza-accordion',
  templateUrl: './natureza-accordion.component.html',
  styleUrls: ['./natureza-accordion.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class NaturezaAccordionComponent {
  @Input() natureza!: INatureza;

  @Output() editarNaturezaEvent = new EventEmitter<INatureza>();
  @Output() deletarNaturezaEvent = new EventEmitter<INatureza>();

  editarNatureza(natureza: INatureza, event: Event) {
    event.stopPropagation();
    this.editarNaturezaEvent.emit(natureza);
  }

  deletarNatureza(natureza: INatureza, event: Event) {
    event.stopPropagation();
    this.deletarNaturezaEvent.emit(natureza);
  }
}
