import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenu,
  IonMenuButton,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonRouterOutlet,
  IonFooter,
} from '@ionic/angular/standalone';
import { IQuadro } from 'src/app/interfaces/ocorrencias/IQuadro';
import { AccountsService } from 'src/app/services/auth.service';
import { QuadrosService } from 'src/app/services/quadros.service';
@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  standalone: true,
  imports: [
    IonFooter,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonMenu,
    IonMenuButton,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonRouterOutlet,
    CommonModule,
  ],
  styleUrls: ['./side-nav.component.scss'],
})
export class SideNavComponent implements OnInit {
  isAdministrador = false;
  showOcorrenciasDropdown = false;
  quadros: IQuadro[] = [];

  constructor(
    private router: Router,
    private authService: AccountsService,
    private quadroService: QuadrosService
  ) {}

  ngOnInit() {
    this.checkPermissoes();
    this.carregarQuadros();
  }

  async checkPermissoes() {
    const role = await this.authService.getRole();
    // Ajuste conforme sua lógica de role
    this.isAdministrador = role.includes('Administrador');
  }

  carregarQuadros() {
    // Chama seu serviço que retorna a lista de quadros
    this.quadroService.listarTodos().subscribe({
      next: (data) => {
        this.quadros = data;
      },
      error: (err) => console.error('Erro ao buscar quadros', err),
    });
  }

  toggleOcorrencia() {
    this.showOcorrenciasDropdown = !this.showOcorrenciasDropdown;
  }

  goToQuadro(quadroId: string) {
    this.router.navigate(['home/quadro', quadroId]);
  }

  goToUsuarios() {
    this.router.navigate(['home/usuarios']);
  }
  goToNaturezas() {
    this.router.navigate(['home/naturezas']);
  }
  logOut() {
    this.authService.logOut();
  }
}
