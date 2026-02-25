import { inject, Injectable } from '@angular/core';
import { environmentApiUrl } from 'src/environments/environment';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastCtrl = inject(ToastController);

  constructor() {}

  public async showToast(
    msg: string,
    color: 'success' | 'warning' | 'danger',
    position: 'top' | 'middle' | 'bottom',
  ) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      color: color,
      position: position,
    });
    toast.present();
  }
}
