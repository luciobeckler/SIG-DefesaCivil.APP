import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IEtapa } from 'src/app/interfaces/ocorrencias/IEtapa';
import { IQuadroDetalhes } from 'src/app/interfaces/ocorrencias/IQuadro';
import { QuadrosService } from 'src/app/services/quadros.service';
import { addIcons } from 'ionicons';
import {
  chevronDown,
  chevronUp,
  clipboardOutline,
  informationCircleOutline,
  people,
  warning,
  logOut,
  bookmarks,
  addCircleOutline,
  filterOutline,
} from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { EtapaComponent } from 'src/app/components/etapa/etapa.component';
import { IOcorrenciaPreviewDTO } from 'src/app/interfaces/ocorrencias/IOcorrencias';

@Component({
  selector: 'app-quadro',
  templateUrl: './quadro.component.html',
  styleUrls: ['./quadro.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule, EtapaComponent],
  standalone: true,
})
export class QuadroComponent implements OnInit {
  etapas: IEtapa[] = [];
  public quadroId: string = '';

  connectedDropLists: string[] = [];

  constructor(
    private router: Router,
    private quadroService: QuadrosService,
    private route: ActivatedRoute
  ) {
    addIcons({
      chevronDown,
      chevronUp,
      clipboardOutline,
      informationCircleOutline,
      people,
      warning,
      logOut,
      bookmarks,
      addCircleOutline,
      filterOutline,
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.quadroId = params.get('id') ?? '';
      if (this.quadroId && this.quadroId !== 'null') {
        this.getEtapasFromQuadroId();
      }
    });
  }

  getEtapasFromQuadroId() {
    this.quadroService.obterPorId(this.quadroId).subscribe({
      next: (data: IQuadroDetalhes) => {
        this.etapas = data.etapas;
      },
      error: (err) => console.error('Erro ao buscar detalhes', err),
    });
  }

  aplicarFiltros() {
    console.log('Filtros aplicados');
  }
}
