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
      },
      error: (err) => {
        this.loadingService.hide();
        console.error('Erro ao carregar naturezas:', err);
        alert(
          'Ocorreu um erro ao carregar as naturezas. Tente novamente mais tarde.'
        );
      },
      complete: () => {
        this.loadingService.hide();
      },
    });
  }

  criarNatureza() {
    this.editingNatureza = null;
    this.modalTitle = 'Criar Natureza';
    this.form.reset();
    this.modalOpen = true;
  }

  abrirModalEdicao(natureza: INatureza) {
    this.editingNatureza = natureza;

    this.naturezaPaiSelecionada = this.buscarNaturezaPorIdRecursivo(
      this.naturezas,
      natureza.naturezaPaiId
    );

    this.modalTitle = 'Editar natureza';

    this.form.patchValue({
      nome: natureza.nome,
      codigoNatureza: natureza.codigoNatureza,
      codigoNaturezaPai: this.naturezaPaiSelecionada
        ? this.naturezaPaiSelecionada.codigoNatureza
        : '',
    });

    this.modalOpen = true;
  }

  private buscarNaturezaPorIdRecursivo(
    lista: INatureza[],
    id: string | null
  ): INatureza | null {
    if (!id) return null;

    for (const item of lista) {
      if (item.id === id) return item;

      if (item.subNaturezas && item.subNaturezas.length > 0) {
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
    this.loadingService.show();

    const dto: ISendNatureza = this.form.value;

    if (this.editingNatureza) {
      this.updateNatureza(dto);
    } else {
      this.createNatureza(dto);
    }
  }

  updateNatureza(dto: ISendNatureza) {
    debugger;
    this.naturezaService.update(this.editingNatureza!.id, dto).subscribe({
      next: () => {
        this.loadNaturezas();
        this.fecharModal();
        this.loadingService.hide();
      },
      error: (err) => {
        alert('Ocorreu um erro ao atualizar a natureza.');
        console.error('Erro ao atualizar natureza:', err);
        this.loadingService.hide();
      },
    });
  }

  createNatureza(dto: ISendNatureza) {
    this.naturezaService.create(dto).subscribe({
      next: () => {
        this.loadNaturezas();
        this.fecharModal();
        this.loadingService.hide();
      },
      error: (err) => {
        alert('Ocorreu um erro ao criar a natureza.');
        console.error('Erro ao criar natureza:', err);
        this.loadingService.hide();
      },
    });
  }

  async deletarNatureza(natureza: INatureza) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Exclusão',
      message: `Deseja excluir a natureza ${natureza.nome}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          handler: () => {
            this.loadingService.show();
            this.naturezaService
              .delete(natureza.codigoNatureza)
              .subscribe(() => {
                this.loadNaturezas();
                this.loadingService.hide();
              });
          },
        },
      ],
    });
    await alert.present();
  }
}
