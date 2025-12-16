import { CommonModule } from '@angular/common';
import { Component, input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { IOcorrenciaPreviewDTO } from 'src/app/interfaces/ocorrencias/IOcorrencias';

@Component({
  selector: 'app-ocorrencia',
  templateUrl: './ocorrencia.component.html',
  styleUrls: ['./ocorrencia.component.scss'],
  imports: [IonicModule, CommonModule],
  standalone: true,
})
export class OcorrenciaComponent implements OnInit {
  getRua(endereco: string | null): string {
    if (!endereco) return 'Local não informado';
    return endereco.split(',')[0];
  }

  // Extrai Bairro
  getBairro(endereco: string | null): string {
    if (!endereco) return '';
    const partes = endereco.split(',');
    return partes.length > 1 ? partes.slice(1).join(',').trim() : '';
  }

  // Pega iniciais para o Avatar (Ex: "lucio.passos@..." -> "L")
  getIniciais(email: string | null): string {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  }

  // Retorna a COR DO IONIC (primary, danger, warning, tertiary, success)
  getRiskColor(risco: string): string {
    const r = risco.toLowerCase();

    if (r.includes('geologico') || r.includes('terra')) return 'warning'; // Amarelo/Laranja
    if (r.includes('construtivo') || r.includes('estrutura')) return 'danger'; // Vermelho
    if (r.includes('agua') || r.includes('inundacao')) return 'tertiary'; // Azul
    if (r.includes('biologico')) return 'success'; // Verde

    return 'medium'; // Cinza padrão
  }
  ocorrencia = input.required<IOcorrenciaPreviewDTO>();

  constructor() {}

  ngOnInit() {}
}
