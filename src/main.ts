import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { addIcons } from 'ionicons';
import {
  people,
  calendar,
  filterOutline,
  saveOutline,
  informationCircleOutline,
  ellipsisVerticalCircleOutline,
  timeOutline,
  documentTextOutline,
  documentAttachOutline,
  add,
  warning,
  bookmarks,
  trash,
  pencil,
  eye,
  eyeOff,
  checkmarkCircle,
  closeCircle,
  closeCircleOutline,
  arrowUndoOutline,
  key,
  arrowBack,
  logOut,
  personAdd,
  cloudDownloadOutline,
  attachOutline,
  linkOutline,
  eyeOutline,
  trashBinOutline,
  trashOutline,
  pencilOutline,
  alertCircle,
  thermometer,
  shieldCheckmark,
  helpCircle,
  earth,
  hammer,
  leaf,
  ellipsisHorizontalCircle,
  alert,
  locationSharp,
  personOutline,
  locationOutline,
  warningOutline,
  fileTrayFullOutline,
  constructOutline,
  lockClosed,
} from 'ionicons/icons';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideNgxMask } from 'ngx-mask';
import { CookieService } from 'ngx-cookie-service';
import { TokenInterceptor } from './app/interceptors/token.interceptor';
import { loadingInterceptor } from './app/interceptors/loading.interceptor';
import { APP_INITIALIZER } from '@angular/core';
import { PermissionService } from './app/services/permission.service';

addIcons({
  people,
  calendar,
  timeOutline,
  saveOutline,
  filterOutline,
  locationOutline,
  cloudDownloadOutline,
  documentAttachOutline,
  documentTextOutline,
  ellipsisVerticalCircleOutline,
  attachOutline,
  arrowUndoOutline,
  closeCircleOutline,
  lockClosed,
  warningOutline,
  fileTrayFullOutline,
  constructOutline,
  linkOutline,
  eyeOutline,
  trashBinOutline,
  informationCircleOutline,
  trashOutline,
  add,
  warning,
  bookmarks,
  trash,
  pencil,
  eye,
  eyeOff,
  checkmarkCircle,
  closeCircle,
  key,
  arrowBack,
  logOut,
  personAdd,
  pencilOutline,
  alertCircle,
  thermometer,
  shieldCheckmark,
  helpCircle,
  earth,
  hammer,
  leaf,
  ellipsisHorizontalCircle,
  alert,
  locationSharp,
  personOutline,
});

export function initPermissions(permService: PermissionService) {
  return () => permService.loadPermissions();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: APP_INITIALIZER,
      useFactory: initPermissions,
      deps: [PermissionService],
      multi: true,
    },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideNgxMask({
      dropSpecialCharacters: true,
      validation: true,
    }),
    provideHttpClient(
      withInterceptorsFromDi(),
      withInterceptors([loadingInterceptor]),
    ),
    CookieService,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
  ],
});
