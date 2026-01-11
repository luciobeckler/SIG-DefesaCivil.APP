// admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AccountsService } from '../auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(
    private accountsService: AccountsService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const role = this.accountsService.getRole();

    if (role.includes('Administrador')) {
      return true;
    }

    this.router.navigate(['/home']);
    return false;
  }
}
