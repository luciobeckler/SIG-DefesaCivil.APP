import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadChildren, Router } from '@angular/router';
import { ILogin } from 'src/app/interfaces/auth/ILogin';
import { AccountsService } from 'src/app/services/accounts/accounts.service';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  constructor(
    private router: Router,
    private accountService: AccountsService,
    private loadingService: LoadingService
  ) {}

  loginInfo: ILogin = {
    email: '',
    senha: '',
  };

  async onLogin() {
    await this.loadingService.show();

    if (this.loginInfo.email && this.loginInfo.senha) {
      //!todo trocar depois
      this.loginInfo.email = 'admin@teste.com';
      this.loginInfo.senha = 'Beckler111*';
      await this.accountService.login(this.loginInfo).subscribe({
        next: (res) => {
          this.router.navigate(['/home']);
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
}
