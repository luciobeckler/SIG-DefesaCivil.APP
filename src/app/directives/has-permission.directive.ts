import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { EPermission } from '../auth/permissions.enum';
import { PermissionService } from '../services/permission.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private permissionService = inject(PermissionService);

  @Input() set appHasPermission(permission: EPermission | string) {
    this.updateView(permission);
  }

  private updateView(permission: EPermission | string) {
    if (this.permissionService.hasPermission(permission)) {
      // Se tem permissão, renderiza o elemento
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      // Se não tem, remove do DOM
      this.viewContainer.clear();
    }
  }
}
