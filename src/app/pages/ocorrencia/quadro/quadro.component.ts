import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IEtapa } from 'src/app/interfaces/ocorrencias/IEtapa';
import { IQuadroDetalhes } from 'src/app/interfaces/ocorrencias/IQuadro';
import { QuadrosService } from 'src/app/services/quadros.service';
// Importações para corrigir o erro do ícone (Ionic 7+)
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
} from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { EtapaComponent } from 'src/app/components/etapa/etapa.component';

@Component({
  selector: 'app-quadro',
  templateUrl: './quadro.component.html',
  styleUrls: ['./quadro.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule, EtapaComponent],
})
export class QuadroComponent implements OnInit {
  aplicarFiltros() {
    throw new Error('Method not implemented.');
  }
  etapas: IEtapa[] = [];
  public quadroId: string = '';

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
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.quadroId = params.get('id') ?? '';

      if (this.quadroId && this.quadroId !== 'null') {
        this.getEtapasFromQuadroId();
      } else {
        console.error('ID do quadro inválido ou não encontrado na URL.');
      }
    });
  }

  getEtapasFromQuadroId() {
    this.quadroService.obterPorId(this.quadroId).subscribe({
      next: (data: IQuadroDetalhes) => {
        this.etapas = data.etapas;
        console.log('Etapas carregadas:', this.etapas);
      },
      error: (err) => console.error('Erro ao buscar detalhes do quadro', err),
    });
  }
}
