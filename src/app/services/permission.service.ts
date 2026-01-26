import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environmentApiUrl } from '../helper/constantes';
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  // Mapa de Definições (Metadados do Sistema)
  // Ex: { OcorrenciaCriar: "ocorrencia:criar" }
  public PermissionMap: Record<string, string> = {};

  constructor() {}

  /**
   * Carrega as definições do Back-end ao iniciar o App
   */
  async loadPermissions() {
    try {
      this.PermissionMap = await lastValueFrom(
        this.http.get<Record<string, string>>(
          `${environmentApiUrl}/config/permissions`,
        ),
      );
    } catch (e) {
      console.error('Falha ao carregar mapa de permissões', e);
    }
  }

  hasPermission(permission: string): boolean {
    const userPermissions = this.authService.getUserPermissions();
    if (!userPermissions || userPermissions.length === 0) return false;

    return userPermissions.includes(permission);
  }

  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every((p) => this.hasPermission(p));
  }
}
