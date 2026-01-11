import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { NaturezaService } from 'src/app/services/naturezas.service';
import {
  ISendNatureza,
  INatureza,
} from 'src/app/interfaces/naturezas/INatureza';
import { NaturezaAccordionComponent } from 'src/app/components/natureza-accordion/natureza-accordion.component';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-naturezas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    NaturezaAccordionComponent,
  ],
  templateUrl: './naturezas.component.html',
  styleUrls: ['./naturezas.component.scss'],
})
export class NaturezasComponent implements OnInit {
  naturezas: INatureza[] = [];
  naturezasFiltradas: INatureza[] = []; // Para a busca
  modalOpen = false;
  form: FormGroup;
  modalTitle = '';
  editingNatureza: INatureza | null = null;
  naturezaPaiSelecionada: INatureza | null = null;

  constructor(
    private naturezaService: NaturezaService,
    private alertCtrl: AlertController,
    private fb: FormBuilder,
    private loadingService: LoadingService
  ) {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      codigoNatureza: ['', Validators.required],
      descricao: [''], // Novo campo
      codigoNaturezaPai: [''],
    });
  }

  ngOnInit() {
    this.loadNaturezas();
  }

  loadNaturezas() {
    this.loadingService.show();
    this.naturezaService.getAll().subscribe({
      next: (res) => {
        this.naturezas = res;
        this.naturezasFiltradas = res; // Inicializa filtro
      },
      error: (err) => {
        this.loadingService.hide();
        console.error('Erro:', err);
      },
      complete: () => {
        this.loadingService.hide();
      },
    });
  }

  // ... imports e restante do código

  handleSearch(event: any) {
    const query = event.target.value?.toLowerCase() || '';

    if (!query.trim()) {
      // Se a busca estiver vazia, restaura a lista original completa
      this.naturezasFiltradas = [...this.naturezas];
      return;
    }

    // Chama a função recursiva passando a lista original completa
    this.naturezasFiltradas = this.filtrarRecursivamente(this.naturezas, query);
  }

  /**
   * Filtra a árvore de naturezas recursivamente.
   * Regra:
   * 1. Se o Pai der match (Nome ou Código), exibe o pai e TODOS os seus filhos (para exploração).
   * 2. Se o Pai NÃO der match, mas um Filho der, exibe o pai contendo APENAS o filho filtrado.
   */
  private filtrarRecursivamente(
    itens: INatureza[],
    texto: string
  ): INatureza[] {
    const resultado: INatureza[] = [];

    for (const item of itens) {
      // Verifica match no item atual (Nome OU Código COBRADE)
      const matchSelf =
        item.nome.toLowerCase().includes(texto) ||
        item.codigoNatureza.includes(texto); // Código já costuma ser numérico/string exata, mas includes funciona bem

      // Filtra os filhos recursivamente
      const filhosFiltrados = this.filtrarRecursivamente(
        item.subNaturezas || [],
        texto
      );

      if (matchSelf) {
        // CASO 1: O próprio item foi encontrado.
        // UX: Mostramos ele e mantemos TODOS os seus filhos originais,
        // assumindo que o usuário encontrou a categoria que queria e quer ver o que tem dentro.
        resultado.push({ ...item });
      } else if (filhosFiltrados.length > 0) {
        // CASO 2: O item não bateu, mas tem filhos que bateram.
        // Adicionamos este item (como um "container") e substituímos
        // seus filhos apenas pelos que foram encontrados.
        resultado.push({ ...item, subNaturezas: filhosFiltrados });
      }
    }

    return resultado;
  }

  criarNatureza() {
    this.editingNatureza = null;
    this.modalTitle = 'Nova Natureza';
    this.form.reset();
    this.modalOpen = true;
  }

  abrirModalEdicao(natureza: INatureza) {
    this.editingNatureza = natureza;

    // Busca recursiva para achar o objeto pai e pegar o código dele
    this.naturezaPaiSelecionada = this.buscarNaturezaPorIdRecursivo(
      this.naturezas,
      natureza.naturezaPaiId
    );

    this.modalTitle = 'Editar Natureza';

    this.form.patchValue({
      nome: natureza.nome,
      codigoNatureza: natureza.codigoNatureza,
      descricao: natureza.descricao,
      codigoNaturezaPai: this.naturezaPaiSelecionada
        ? this.naturezaPaiSelecionada.codigoNatureza
        : '',
    });

    this.modalOpen = true;
  }

  // ... (buscarNaturezaPorIdRecursivo mantém igual) ...
  private buscarNaturezaPorIdRecursivo(
    lista: INatureza[],
    id: string | null
  ): INatureza | null {
    if (!id) return null;
    for (const item of lista) {
      if (item.id === id) return item;
      if (item.subNaturezas?.length) {
        const encontrado = this.buscarNaturezaPorIdRecursivo(
          item.subNaturezas,
          id
        );
        if (encontrado) return encontrado;
      }
    }
    return null;
  }

  fecharModal() {
    this.modalOpen = false;
    this.editingNatureza = null;
    this.naturezaPaiSelecionada = null;
  }

  salvarNatureza() {
    if (this.form.invalid) return;

    this.loadingService.show();
    const dto: ISendNatureza = this.form.value;

    if (this.editingNatureza) {
      this.naturezaService.update(this.editingNatureza.id, dto).subscribe({
        next: () => this.handleSuccess(),
        error: () => this.handleError(),
      });
    } else {
      this.naturezaService.create(dto).subscribe({
        next: () => this.handleSuccess(),
        error: () => this.handleError(),
      });
    }
  }

  handleSuccess() {
    this.loadNaturezas();
    this.fecharModal();
    this.loadingService.hide();
  }

  handleError() {
    this.loadingService.hide();
    alert('Erro ao processar solicitação.');
  }

  async deletarNatureza(natureza: INatureza) {
    const alert = await this.alertCtrl.create({
      header: 'Excluir Natureza',
      subHeader: natureza.nome,
      message: 'Tem certeza? Isso pode afetar sub-naturezas.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.loadingService.show();
            // Usa ID, não Código
            this.naturezaService.delete(natureza.id).subscribe({
              next: () => this.handleSuccess(),
              error: () => this.handleError(),
            });
          },
        },
      ],
    });
    await alert.present();
  }
}
