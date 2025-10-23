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
    canActivate: [AuthGuard],
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
        path: 'evento-list',
        loadComponent: () =>
          import('./pages/evento/evento-list/evento-list.page').then(
            (m) => m.EventoListPage
          ),
      },
      {
        path: 'evento-detail/:id',
        loadComponent: () =>
          import('./pages/evento/evento-detail/evento-detail.page').then(
            (m) => m.EventoDetailPage
          ),
      },
      {
        path: 'evento-form/:id',
        loadComponent: () =>
          import('./pages/evento/evento-form/evento-form.page').then(
            (m) => m.EventoFormPage
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
