import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { EventoService } from 'src/app/services/evento.service';
import { first, Subject, takeUntil } from 'rxjs';
import {
  IEventoPreview,
  IEventoDetalhes,
} from 'src/app/interfaces/eventos/IEvento';
import { NaturezaService } from 'src/app/services/naturezas.service';
import { IViewNatureza } from 'src/app/interfaces/naturezas/INatureza';

@Component({
  selector: 'app-evento-form',
  templateUrl: './evento-form.page.html',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, IonicModule],
})
export class EventoFormPage implements OnInit, OnDestroy {
  @ViewChild('fileUpload') fileUploadInput!: ElementRef<HTMLInputElement>;

  eventoForm!: FormGroup;
  isEditMode = false;
  eventoId?: string;
  eventosDisponiveis: IEventoPreview[] = [];
  naturezasDisponiveis: IViewNatureza[] = [];
  selectedFiles: File[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private eventoService: EventoService,
    private naturezaService: NaturezaService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.buildForm();
    this.checkEditModeAndLoadData();
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
  }

  private checkEditModeAndLoadData(): void {
    this.loadDropdownData();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.eventoId = id;
      this.loadEventoForEdit();
    }
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

  private loadEventoForEdit(): void {
    if (!this.eventoId) return;

    this.eventoService
      .getEventoDetalhes(this.eventoId)
      .pipe(first())
      .subscribe((evento: IEventoDetalhes) => {
        this.patchFormValues(evento);
      });
  }

  private patchFormValues(evento: IEventoDetalhes): void {
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

    this.eventoForm.get('codigo')?.disable();
  }

  onFilesSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const files = element.files;
    const maxFiles = 5;

    if (!files || files.length === 0) return;

    const currentFileCount = this.selectedFiles.length;
    const allowedToAdd = maxFiles - currentFileCount;

    if (allowedToAdd <= 0) {
      this.presentToast(`Limite de ${maxFiles} anexos já atingido.`, 'warning');
    } else {
      const filesToAdd = Array.from(files).slice(0, allowedToAdd);

      filesToAdd.forEach((file) => {
        this.selectedFiles.push(file);
      });

      if (files.length > allowedToAdd) {
        this.presentToast(
          `Limite de ${maxFiles} anexos atingido. Apenas os primeiros ${allowedToAdd} arquivos foram adicionados.`,
          'warning'
        );
      }
    }

    if (this.fileUploadInput) this.fileUploadInput.nativeElement.value = '';
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
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

    this.selectedFiles.forEach((file) => {
      formData.append('anexos', file, file.name);
    });

    return formData;
  }

  private saveEvento(formData: FormData): void {
    if (this.isEditMode && this.eventoId) {
      this.eventoService
        .updateEvento(this.eventoId, formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.handleSaveSuccess(null),
          error: (err: any) => this.handleSaveError(err),
        });
    } else {
      this.eventoService
        .createEvento(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: IEventoDetalhes) => this.handleSaveSuccess(response),
          error: (err: any) => this.handleSaveError(err),
        });
    }
  }

  private handleSaveSuccess(response: IEventoDetalhes | null | void): void {
    const message = this.isEditMode
      ? 'Evento atualizado com sucesso!'
      : 'Evento criado com sucesso!';
    this.presentToast(message, 'success');

    const targetId = this.isEditMode
      ? this.eventoId
      : (response as IEventoDetalhes)?.id;
    this.router.navigate(['/home/evento-detail', targetId || 'list']);
  }

  private handleSaveError(err: any): void {
    const baseMessage = this.isEditMode
      ? 'Erro ao atualizar evento'
      : 'Erro ao criar evento';
    const specificError =
      err.error?.message || err.message || 'Erro desconhecido.';
    this.presentToast(`${baseMessage}: ${specificError}`, 'danger');
    console.error(baseMessage, err);
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
}
