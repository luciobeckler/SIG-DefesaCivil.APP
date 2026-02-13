import { inject, Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular/standalone';

// Interface para definir uma opção de seleção genérica
export interface IOptionAlert<T = any> {
  label: string;
  value: T;
  acao?: (valor: T) => void | Promise<void>;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private alertCtrl = inject(AlertController);

  public async showSelectionAlert<T>(
    header: string,
    message: string,
    opcoes: IOptionAlert<T>[],
    textoBotaoConfirmar: string = 'Confirmar',
    textoBotaoCancelar: string = 'Cancelar',
  ): Promise<T | null> {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      backdropDismiss: false,
      // Mapeia suas opções genéricas para o formato do Ionic
      inputs: opcoes.map((op) => ({
        type: 'radio',
        label: op.label,
        value: op.value,
      })),
      buttons: [
        {
          text: textoBotaoCancelar,
          role: 'cancel',
        },
        {
          text: textoBotaoConfirmar,
          role: 'confirm',
        },
      ],
    });

    await alert.present();

    const { role, data } = await alert.onDidDismiss();

    // Se cancelou ou não selecionou nada, retorna null
    if (role !== 'confirm' || data?.values === undefined) {
      return null;
    }

    const selectedValue = data.values;

    // --- LÓGICA DE EXECUÇÃO DE FUNÇÃO ---
    // Encontra a opção original para verificar se tem uma função atrelada
    const opcaoEscolhida = opcoes.find((op) => op.value === selectedValue);

    if (opcaoEscolhida && opcaoEscolhida.acao) {
      await opcaoEscolhida.acao(selectedValue);
    }

    return selectedValue;
  }

  public async showConfirmationAlert(
    header: string,
    message: string,
    textoConfirmar: string = 'Sim',
    textoCancelar: string = 'Não',
  ): Promise<boolean> {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: [
        { text: textoCancelar, role: 'cancel' },
        { text: textoConfirmar, role: 'confirm' },
      ],
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === 'confirm';
  }
}
