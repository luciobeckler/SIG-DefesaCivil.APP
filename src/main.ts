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
} from 'ionicons/icons';
import { provideHttpClient } from '@angular/common/http';

addIcons({
  people,
  calendar,
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
  ],
});
