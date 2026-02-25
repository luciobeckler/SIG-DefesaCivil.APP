import { Routes } from '@angular/router';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { permissionGuard } from './services/guards/permission.guard';
import { EPermission } from './auth/permissions.enum';
// Recomendo criar um authGuard para proteger toda a rota 'home'
// import { authGuard } from './services/guards/auth.guard';

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
    path: 'home',
    component: SideNavComponent,
    // canActivate: [authGuard], // Protege o acesso a qualquer sub-rota de home
    children: [
      {
        path: '',
        redirectTo: 'quadro',
        pathMatch: 'full',
      },
      {
        path: 'quadro',
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
    path: '**',
    redirectTo: 'login',
  },
];
