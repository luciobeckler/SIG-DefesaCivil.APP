import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loading: HTMLIonLoadingElement | null = null;
  private requestCount = 0;

  constructor(private loadingController: LoadingController) {}

  async show(message: string = 'Processando...') {
    this.requestCount++;

    if (this.requestCount === 1 && !this.loading) {
      this.loading = await this.loadingController.create({
        message,
        spinner: 'crescent',
        backdropDismiss: false,
      });
      await this.loading.present();
    }
  }

  async hide() {
    this.requestCount--;

    if (this.requestCount < 0) {
      this.requestCount = 0;
    }

    if (this.requestCount === 0 && this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }
  }
}
