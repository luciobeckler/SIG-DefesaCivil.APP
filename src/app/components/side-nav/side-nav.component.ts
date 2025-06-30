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
  constructor(private router: Router) {}

  ngOnInit() {}

  goToUsuarios() {
    this.router.navigate(['/home/usuarios']);
  }

  goToEventos() {
    this.router.navigate(['/home/eventos']);
  }
}
