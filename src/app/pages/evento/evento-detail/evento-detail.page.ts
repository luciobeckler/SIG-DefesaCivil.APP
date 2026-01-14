import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  IonicModule,
  AlertController,
  ModalController,
  ActionSheetController,
  ToastController,
} from '@ionic/angular';
import { Observable, Subject, first, takeUntil, tap } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
  Validators,
} from '@angular/forms';

import {
  IOcorrenciaDetalhes,
  IOcorrenciaPreview,
} from 'src/app/interfaces/ocorrencias/IEvento';
import { IEventoHistorico } from 'src/app/interfaces/ocorrencias/IEventoHistorico';
import { INaturezaResumo } from 'src/app/interfaces/naturezas/INatureza';

import { EventoService } from 'src/app/services/evento.service';
import { NaturezaService } from 'src/app/services/naturezas.service';

import { HistoricoModalComponent } from 'src/app/components/evento-historico-modal/evento-historico-modal.component';
import { IAnexo } from 'src/app/interfaces/anexos/IAnexos';

@Component({
  selector: 'app-evento-detail',
  templateUrl: './evento-detail.page.html',
  standalone: true,

  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class EventoDetailPage implements OnInit, OnDestroy {
  @ViewChild('fileUpload') fileUploadInput!: ElementRef<HTMLInputElement>;

  evento: IOcorrenciaDetalhes | null = null;
  eventoId!: string;
  historico$!: Observable<IEventoHistorico[]>;

  eventoForm!: FormGroup;
  isEditMode = false;
  eventosDisponiveis: IOcorrenciaPreview[] = [];
  naturezasDisponiveis: INaturezaResumo[] = [];
  anexos: IAnexo[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private eventoService: EventoService,
    private router: Router,
    private alertController: AlertController,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private toastController: ToastController,
    private fb: FormBuilder,
    private naturezaService: NaturezaService
  ) {}

  ngOnInit() {
    this.eventoId = this.route.snapshot.paramMap.get('id')!;
    this.buildForm();
    this.loadEventoEHistorico();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): void {
    this.eventoForm = this.fb.group({
      codigo: ['', Validators.required],
      titulo: ['', Validators.required],
      descricao: [''],
      endereco: [''],
      status: ['Pendente', Validators.required],
      dataEHoraDoEvento: [new Date().toISOString(), Validators.required],
      eventoPaiId: [null],
      subEventosId: [[]],
      naturezasId: [[]],
    });

    this.eventoForm.disable();
  }

  loadEventoEHistorico() {
    this.eventoService
      .getEventoDetalhes(this.eventoId)
      .pipe(
        first(),
        tap((evento) => {
          this.evento = evento;
          this.patchFormValues(evento);

          if (evento.anexos) {
            this.anexos = evento.anexos.map((a) => ({
              ...a,
              marcadoParaExcluir: false,
            }));
          }
        })
      )
      .subscribe();

    this.historico$ = this.eventoService.getHistoricoDetalhes(this.eventoId);
  }

  private patchFormValues(evento: IOcorrenciaDetalhes): void {
    this.eventoForm.patchValue({
      codigo: evento.codigo,
      titulo: evento.titulo,
      descricao: evento.descricao,
      endereco: evento.endereco,
      status: evento.status,
      dataEHoraDoEvento: evento.dataEHoraDoEvento,
      eventoPaiId: evento.eventoPai?.id || null,
    });

    const subEventosIds = evento.subEventos?.map((s) => s.id) || [];
    this.eventoForm.get('subEventosId')?.setValue(subEventosIds);

    const naturezasIds = evento.naturezas?.map((n: any) => n.id) || [];
    this.eventoForm.get('naturezasId')?.setValue(naturezasIds);
  }

  toggleEditMode(edit: boolean): void {
    this.isEditMode = edit;
    if (edit) {
      this.eventoForm.enable();
      this.eventoForm.get('codigo')?.disable();
      this.loadDropdownData();
    } else {
      this.eventoForm.disable();
    }
  }

  cancelEdit(): void {
    if (this.evento) {
      this.patchFormValues(this.evento);
    }
    this.toggleEditMode(false);
  }

  private loadDropdownData(): void {
    this.loadAvailableEvents();
    this.loadAvailableNatures();
  }

  private loadAvailableEvents(): void {
    this.eventoService
      .getEventosPreview()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (eventos) => {
          this.eventosDisponiveis = this.eventoId
            ? eventos.filter((e) => e.id !== this.eventoId)
            : eventos;
        },
        error: (err) =>
          this.handleLoadError('Erro ao carregar eventos para seleção.', err),
      });
  }

  private loadAvailableNatures(): void {
    this.naturezaService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (naturezas) => {
          this.naturezasDisponiveis = naturezas;
        },
        error: (err) =>
          this.handleLoadError('Erro ao carregar naturezas disponíveis.', err),
      });
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Ações do Evento',
      buttons: [
        {
          text: 'Editar',
          icon: 'pencil',
          handler: () => {
            this.toggleEditMode(true);
          },
        },
        {
          text: 'Ver Histórico',
          icon: 'time-outline',
          handler: () => {
            this.exibirHistoricoModal();
          },
        },
        {
          text: 'Excluir',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            if (this.evento) this.deletar(this.evento);
          },
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }

  onFilesSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const files = element.files;
    const maxFiles = 5;

    if (!files || files.length === 0) return;

    const currentFileCount = this.anexos.filter(
      (a) => !a.marcadoParaExcluir
    ).length;
    const allowedToAdd = maxFiles - currentFileCount;

    if (allowedToAdd <= 0) {
      this.presentToast(`Limite de ${maxFiles} anexos já atingido.`, 'warning');
    } else {
      const filesToAdd = Array.from(files).slice(0, allowedToAdd);
      /* filesToAdd.forEach((file) => {
        this.anexos.push({
          nomeOriginal: file.name,
          file: file,
          marcadoParaExcluir: false,
        });
      }); */
      if (files.length > allowedToAdd) {
        this.presentToast(
          `Limite de ${maxFiles} anexos atingido. Apenas os primeiros ${allowedToAdd} arquivos foram adicionados.`,
          'warning'
        );
      }
    }
    if (this.fileUploadInput) this.fileUploadInput.nativeElement.value = '';
  }

  removerAnexo(anexo: IAnexo, index: number): void {
    if (anexo.id) {
      anexo.marcadoParaExcluir = true;
    } else {
      this.anexos.splice(index, 1);
    }
  }

  desfazerExclusaoAnexo(anexo: IAnexo): void {
    if (anexo.id) {
      anexo.marcadoParaExcluir = false;
    }
  }

  onSubmit() {
    if (!this.validateForm()) return;

    const formData = this.createFormData();
    this.saveEvento(formData);
  }

  private validateForm(): boolean {
    if (this.eventoForm.invalid) {
      this.eventoForm.markAllAsTouched();
      this.presentToast(
        'Por favor, verifique os campos obrigatórios.',
        'warning'
      );
      return false;
    }
    return true;
  }

  private createFormData(): FormData {
    const formData = new FormData();
    const formValues = this.eventoForm.getRawValue();

    Object.keys(formValues).forEach((key) => {
      const value = formValues[key];
      if (key === 'subEventosId' || key === 'naturezasId') {
        if (value && Array.isArray(value) && value.length > 0) {
          value.forEach((item: string) => formData.append(key, item));
        }
      } else if (
        key === 'eventoPaiId' &&
        (!value || String(value).trim() === '')
      ) {
      } else if (value !== null && value !== undefined) {
        const appendValue =
          value instanceof Date ? value.toISOString() : String(value);
        formData.append(key, appendValue);
      }
    });

    this.anexos.forEach((anexo, index) => {
      if (anexo.id) {
        if (anexo.marcadoParaExcluir) {
          formData.append(`anexosParaRemoverIds[${index}]`, anexo.id);
        } else {
          formData.append(`anexosNovos[${index}].id`, anexo.id);
          formData.append(
            `anexosNovos[${index}].nomeOriginal`,
            anexo.nomeOriginal
          );
        }
      } else if (anexo.file && !anexo.marcadoParaExcluir) {
        formData.append('anexos', anexo.file, anexo.nomeOriginal);
      }
    });
    return formData;
  }

  private saveEvento(formData: FormData): void {
    if (!this.isEditMode || !this.eventoId) return;

    this.eventoService
      .updateEvento(this.eventoId, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.handleSaveSuccess(),
        error: (err: any) => this.handleSaveError(err),
      });
  }

  private handleSaveSuccess(): void {
    this.presentToast('Evento atualizado com sucesso!', 'success');
    this.toggleEditMode(false);
    this.loadEventoEHistorico();
  }

  private handleSaveError(err: any): void {
    const specificError =
      err.error?.message || err.message || 'Erro desconhecido.';
    this.presentToast(`Erro ao atualizar evento: ${specificError}`, 'danger');
    console.error('Erro ao atualizar evento', err);
  }

  private handleLoadError(message: string, error: any): void {
    console.error(message, error);
    this.presentToast(message, 'danger');
  }

  async presentToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3500,
      color: color,
      position: 'top',
    });
    toast.present();
  }

  async exibirHistoricoModal() {
    const modal = await this.modalCtrl.create({
      component: HistoricoModalComponent,
      componentProps: { historico$: this.historico$ },
      breakpoints: [0, 0.5, 0.75],
      initialBreakpoint: 0.75,
    });
    await modal.present();
  }

  async deletar(evento: IOcorrenciaDetalhes) {
    const alert = await this.alertController.create({
      header: 'Confirmação',
      message: `Tem certeza que deseja deletar o evento "${evento.titulo}"? Esta ação tornará o evento invisível...`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Deletar', handler: () => this.executarDelecao(evento.id) },
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
        const errorMessage = err.error?.message || 'Erro desconhecido.';
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
}
