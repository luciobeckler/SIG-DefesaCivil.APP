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
} from '@ionic/angular/standalone';
import { AccountsService } from 'src/app/services/accounts/accounts.service';
@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  standalone: true,
  imports: [
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
  constructor(private router: Router, private accountService: AccountsService) {
    this.roles = this.accountService.getRole();
    this.isAdministrador = this.roles.includes('Administrador');
    console.log(this.isAdministrador);
  }
  roles: string[] = [];
  isAdministrador: boolean = false;

  ngOnInit() {}

  goToUsuarios() {
    this.router.navigate(['/home/usuarios']);
  }

  goToEventos() {
    this.router.navigate(['/home/eventos']);
  }

  logOut() {
    this.accountService.logOut().subscribe({
      next: () => {
        alert('Logout executado com sucesso');
      },
      error: (err) => {
        alert('Erro ao fazer logout');
        console.error(err);
      },
    });
  }
}
