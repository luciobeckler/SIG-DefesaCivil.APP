import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ILogin } from 'src/app/interfaces/auth/ILogin';
import { AccountsService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonText,
  IonButton,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonText,
    IonButton,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  roles: string[] = [];

  constructor(
    private router: Router,
    private accountService: AccountsService,
    private loadingService: LoadingService,
  ) {}

  loginInfo: ILogin = {
    email: '',
    senha: '',
  };

  async onLogin() {
    //await this.loadingService.show();
    //CODIGO A BAIXO PARA PERMITIR LOGIN RAPIDO
    this.loginInfo.email = 'admin@teste.com';
    this.loginInfo.senha = 'SenhaForte123!';

    if (this.loginInfo.email && this.loginInfo.senha) {
      await this.accountService.login(this.loginInfo).subscribe({
        next: (res) => {
          this.direcionaAcesso(res.primeiroAcesso);
          this.loadingService.hide();
        },
        error: (err) => {
          alert('Usuário ou senha incorretos.');
          console.error('Erro de login:', err.message);
          this.loadingService.hide();
        },
      });
    }
  }

  async direcionaAcesso(isPrimeiroAcesso: boolean) {
    if (isPrimeiroAcesso === true) {
      this.router.navigate(['/primeiro-login']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
