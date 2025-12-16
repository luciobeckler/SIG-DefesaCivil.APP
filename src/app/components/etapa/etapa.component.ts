import { CommonModule } from '@angular/common';
import { Component, input, OnInit } from '@angular/core';
import { IEtapa } from 'src/app/interfaces/ocorrencias/IEtapa';
import { IonicModule } from '@ionic/angular';
import { NgxMaskDirective } from 'ngx-mask';
import { OcorrenciaComponent } from '../ocorrencia/ocorrencia.component';

@Component({
  selector: 'app-etapa',
  templateUrl: './etapa.component.html',
  styleUrls: ['./etapa.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, OcorrenciaComponent],
})
export class EtapaComponent implements OnInit {
  etapa = input.required<IEtapa>();

  constructor() {}

  ngOnInit() {}
}
