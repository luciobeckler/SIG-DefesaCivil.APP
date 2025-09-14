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
}
