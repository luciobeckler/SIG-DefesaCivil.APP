import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '../permission.service';

export const permissionGuard: CanActivateFn = (route, state) => {
  const permission = route.data['requiredPermission'];
  const service = inject(PermissionService);
  const router = inject(Router);

  if (service.hasPermission(permission)) {
    return true;
  }

  // Redireciona se não tiver acesso
  router.navigate(['/home']);
  return false;
};
