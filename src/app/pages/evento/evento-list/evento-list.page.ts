import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Subscription, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { EventoService } from 'src/app/services/evento.service';
import { IEventoPreview } from 'src/app/interfaces/eventos/IEvento';
import { LoadingService } from 'src/app/services/loading.service';
import { FormatStatusPipe } from 'src/app/pipes/format-status.pipe';
import { EStatus } from 'src/app/helper/statusEnum';
import { IViewNatureza } from 'src/app/interfaces/naturezas/INatureza';
import { NaturezaService } from 'src/app/services/naturezas.service';

@Component({
  selector: 'app-evento-list',
  templateUrl: './evento-list.page.html',
  styleUrls: ['./evento-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    FormatStatusPipe,
    ReactiveFormsModule,
  ],
})
export class EventoListPage implements OnInit, OnDestroy {
  searchTerm = new FormControl('');

  selectedNaturezas = new FormControl<string[] | null>(null);

  private allEventos: IEventoPreview[] = [];
  filteredEventos: IEventoPreview[] = [];
  availableNatures: IViewNatureza[] = [];

  groupedEvents: { [key in EStatus]?: IEventoPreview[] } = {};

  statusOrder: EStatus[] = [
    EStatus.Pendente,
    EStatus.EmAnalise,
    EStatus.EmAtendimento,
    EStatus.EmMonitoramento,
    EStatus.Finalizado,
    EStatus.Cancelado,
  ];

  isLoading = true;

  private filterSubscription: Subscription | null = null;
  private dataSubscription: Subscription | null = null;

  constructor(
    private eventoService: EventoService,
    private naturezaService: NaturezaService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.setupFilters();
  }

  ngOnDestroy() {
    this.filterSubscription?.unsubscribe();
    this.dataSubscription?.unsubscribe();
  }

  ionViewWillEnter() {
    this.loadInitialData();
  }

  loadInitialData() {
    if (
      this.isLoading &&
      this.dataSubscription &&
      !this.dataSubscription.closed
    ) {
      console.log('Already loading data, skipping fetch.');
      return;
    }

    this.isLoading = true;
    this.loadingService.show();
    this.dataSubscription?.unsubscribe();

    this.dataSubscription = combineLatest([
      this.eventoService.getEventosPreview(),
      this.naturezaService.getAll(),
    ]).subscribe({
      next: ([eventosRes, naturesRes]) => {
        this.allEventos = eventosRes;
        this.availableNatures = naturesRes;
        this.applyFilters(
          this.searchTerm.value ?? undefined,
          this.selectedNaturezas.value ?? undefined
        );
        this.isLoading = false;
        console.log('Data loaded successfully.');
      },
      error: (err) => {
        console.error('Erro ao carregar dados iniciais:', err);
        alert('Ocorreu um erro ao carregar os dados. Tente novamente.');
        this.isLoading = false;
        this.loadingService.hide();
      },
      complete: () => {
        this.loadingService.hide();
        console.log('Data loading complete.');
      },
    });
  }

  setupFilters() {
    this.filterSubscription?.unsubscribe();

    this.filterSubscription = combineLatest([
      this.searchTerm.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        startWith(this.searchTerm.value)
      ),
      this.selectedNaturezas.valueChanges.pipe(
        startWith(this.selectedNaturezas.value)
      ), // Use current value on init
    ]).subscribe(([term, natureIds]) => {
      this.applyFilters(term ?? undefined, natureIds ?? undefined);
    });
  }
  applyFilters(term?: string, natureIds?: string[]) {
    let tempEventos = [...this.allEventos];

    if (term && term.trim() !== '') {
      const lowerTerm = term.toLowerCase();
      tempEventos = tempEventos.filter(
        (evento) =>
          evento.codigo.toLowerCase().includes(lowerTerm) ||
          evento.titulo.toLowerCase().includes(lowerTerm)
      );
    }

    if (natureIds && natureIds.length > 0) {
      const natureIdSet = new Set(natureIds);
      tempEventos = tempEventos.filter((evento) =>
        evento.naturezas?.some((nat) => natureIdSet.has(nat.id))
      );
    }

    this.filteredEventos = tempEventos;
    this.groupEventsByStatus();
  }

  groupEventsByStatus() {
    this.groupedEvents = {};

    this.statusOrder.forEach((statusKey) => {
      this.groupedEvents[statusKey] = [];
    });

    this.filteredEventos.forEach((evento) => {
      if (this.groupedEvents[evento.status]) {
        this.groupedEvents[evento.status]?.push(evento);
      } else {
        console.warn(
          `Event ${evento.id} has status ${evento.status} which is not in statusOrder.`
        );
      }
    });
    console.log('Grouped Events:', this.groupedEvents);
  }
}
