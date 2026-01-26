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
import { EPermission } from 'src/app/auth/permissions.enum';
import { HasPermissionDirective } from 'src/app/directives/has-permission.directive';
import { IQuadro } from 'src/app/interfaces/ocorrencias/IQuadro';
import { AuthService } from 'src/app/services/auth.service';
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
    HasPermissionDirective,
  ],
  styleUrls: ['./side-nav.component.scss'],
})
export class SideNavComponent implements OnInit {
  showOcorrenciasDropdown = false;
  quadros: IQuadro[] = [];
  perms = EPermission;

  constructor(
    private router: Router,
    private authService: AuthService,
    private quadroService: QuadrosService,
  ) {}

  ngOnInit() {
    this.carregarQuadros();
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
    this.authService.logOut().subscribe();
  }
}
