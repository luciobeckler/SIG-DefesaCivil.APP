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
} from 'ionicons/icons';
import { provideHttpClient } from '@angular/common/http';
import { provideNgxMask } from 'ngx-mask';

addIcons({
  people,
  calendar,
  timeOutline,
  saveOutline,
  filterOutline,
  cloudDownloadOutline,
  documentAttachOutline,
  documentTextOutline,
  ellipsisVerticalCircleOutline,
  attachOutline,
  arrowUndoOutline,
  closeCircleOutline,
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
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    provideNgxMask(),
  ],
});
