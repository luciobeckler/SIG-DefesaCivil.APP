// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AccountsService } from '../auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private accountsService: AccountsService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const role = this.accountsService.getRole();

    if (role.length == 0) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
