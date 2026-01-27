import { Routes } from '@angular/router';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { permissionGuard } from './services/guards/permission.guard';
import { EPermission } from './auth/permissions.enum';

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
        (m) => m.PrimeiroLoginComponent,
      ),
  },
  {
    path: 'home', // O Layout principal (SideNav) vive aqui
    component: SideNavComponent,
    children: [
      {
        path: 'quadro/:id',
        loadComponent: () =>
          import('./pages/ocorrencia/quadro/quadro.component').then(
            (m) => m.QuadroComponent,
          ),
      },
      {
        path: 'ocorrencia/form/:id',
        loadComponent: () =>
          import('./pages/ocorrencia/ocorrencia-form/ocorrencia-form.component').then(
            (m) => m.OcorrenciaFormPage,
          ),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./pages/usuarios/usuarios.component').then(
            (m) => m.UsuariosComponent,
          ),
        canActivate: [permissionGuard],
        data: { requiredPermission: EPermission.USUARIOS_GERENCIAR },
      },
      // ----------------------
      {
        path: 'naturezas',
        loadComponent: () =>
          import('./pages/naturezas/naturezas.component').then(
            (m) => m.NaturezasComponent,
          ),
        canActivate: [permissionGuard],
        data: { requiredPermission: EPermission.NATUREZAS_GERENCIAR },
      },
    ],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**', // Rota coringa para 404
    redirectTo: 'login',
  },
];
