// app.routes.ts
import { Routes } from '@angular/router';
import { SideNavComponent } from './components/side-nav/side-nav.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'home',
    component: SideNavComponent,
    children: [
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./pages/usuarios/usuarios.component').then(
            (m) => m.UsuariosComponent
          ),
      },
      {
        path: 'eventos',
        loadComponent: () =>
          import('./pages/eventos/eventos.component').then(
            (m) => m.EventosComponent
          ),
      },
    ],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
