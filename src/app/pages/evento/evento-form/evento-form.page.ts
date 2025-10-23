import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { IonicModule, ToastController } from '@ionic/angular';
import { EventoService } from 'src/app/services/evento.service';
import { first } from 'rxjs';
import { IEventoPreview } from 'src/app/interfaces/eventos/IEvento';

@Component({
  selector: 'app-evento-form',
  templateUrl: './evento-form.page.html',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, IonicModule],
})
export class EventoFormPage implements OnInit {
  eventoForm: FormGroup;
  isEditMode = false;
  eventoId?: string;
  eventosDisponiveis: IEventoPreview[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,

    private eventoService: EventoService,
    private router: Router,
    private toastController: ToastController
  ) {
    this.eventoForm = this.fb.group({
      codigo: ['', Validators.required],
      titulo: ['', Validators.required],
      descricao: [''],
      endereco: [''],
      status: ['Pendente', Validators.required],
      dataEHoraDoEvento: [new Date().toISOString(), Validators.required],
      eventoPaiId: [null],
      subEventosId: [[]],
    });
  }

  ngOnInit() {
    this.carregarEventosDisponiveis(); // ** Chama a função de busca

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.eventoId = id;

      this.eventoService
        .getEventoDetalhes(this.eventoId)
        .pipe(first())
        .subscribe((evento) => {
          this.eventoForm.patchValue(evento);

          // Garante que subEventosId seja um array, mesmo se vier null da API
          const subEventos = evento.subEventos?.map((s: any) => s.id) || [];
          this.eventoForm.get('subEventosId')?.setValue(subEventos);

          this.eventoForm.get('codigo')?.disable();
        });
    }
  }

  carregarEventosDisponiveis() {
    this.eventoService
      .getEventosPreview()
      .pipe(first())
      .subscribe({
        next: (eventos) => {
          this.eventosDisponiveis = eventos.filter(
            (e) => e.id !== this.eventoId
          );
        },
        error: (err) => {
          this.presentToast(
            'Erro ao carregar eventos para as relações.',
            'danger'
          );
          console.error('Erro ao carregar eventos:', err);
        },
      });
  }

  onSubmit() {
    if (this.eventoForm.invalid) {
      this.presentToast(
        'Por favor, preencha os campos obrigatórios.',
        'warning'
      );
      return;
    }

    const formValues = this.eventoForm.getRawValue();

    if (this.isEditMode && this.eventoId) {
      this.eventoService.updateEvento(this.eventoId, formValues).subscribe({
        next: () => {
          this.presentToast('Evento atualizado com sucesso!', 'success');
          this.router.navigate(['/home/evento-detail', this.eventoId]);
        },
        error: (err) => {
          this.presentToast(
            `Erro ao atualizar evento: ${
              err.error?.message || 'Verifique os dados.'
            }`,
            'danger'
          );
        },
      });
    } else {
      this.eventoService.createEvento(formValues).subscribe({
        next: (novoEvento) => {
          this.presentToast('Evento criado com sucesso!', 'success');
          this.router.navigate(['/home/evento-detail', novoEvento.id]);
        },
        error: (err) => {
          this.presentToast(
            `Erro ao criar evento: ${
              err.error?.message || 'Verifique os dados.'
            }`,
            'danger'
          );
        },
      });
    }
  }

  async presentToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top',
    });
    toast.present();
  }
}
