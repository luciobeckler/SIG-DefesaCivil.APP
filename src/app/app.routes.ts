// app.routes.ts
import { Routes } from '@angular/router';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { AuthGuard } from './services/routeAuth/auth.guard';
import { AdminGuard } from './services/routeAuth/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'primeiro-login',
    loadComponent: () =>
      import('./pages/login/primeiro-login/primeiro-login.component').then(
        (m) => m.PrimeiroLoginComponent
      ),
  },
  {
    path: 'home',
    component: SideNavComponent,
    canActivate: [AuthGuard], // 🔒 exige autenticação
    children: [
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./pages/usuarios/usuarios.component').then(
            (m) => m.UsuariosComponent
          ),
        canActivate: [AdminGuard],
      },
      {
        path: 'eventos',
        loadComponent: () =>
          import('./pages/eventos/eventos.component').then(
            (m) => m.EventosComponent
          ),
      },
      {
        path: 'naturezas',
        loadComponent: () =>
          import('./pages/naturezas/naturezas.component').then(
            (m) => m.NaturezasComponent
          ),
        canActivate: [AdminGuard],
      },
    ],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
