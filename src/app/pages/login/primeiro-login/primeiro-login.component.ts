import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IAlterarSenha } from 'src/app/interfaces/auth/IAlterarSenha';
import { AccountsService } from 'src/app/services/accounts/accounts.service';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
  selector: 'app-primeiro-login',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './primeiro-login.component.html',
  styleUrls: ['./primeiro-login.component.scss'],
})
export class PrimeiroLoginComponent {
  constructor(
    private router: Router,
    private accountService: AccountsService,
    private loadingService: LoadingService
  ) {}

  alterarSenhaInfo: IAlterarSenha = {
    novaSenha: '',
    confirmarSenha: '',
  };

  senhaVisivel = {
    atual: false,
    nova: false,
    confirmar: false,
  };

  toggleSenhaVisibilidade(campo: 'atual' | 'nova' | 'confirmar') {
    this.senhaVisivel[campo] = !this.senhaVisivel[campo];
  }

  validarSenha(): boolean {
    // Validação de senha forte
    const senhaRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return senhaRegex.test(this.alterarSenhaInfo.novaSenha);
  }

  // Métodos para validação individual dos requisitos da senha
  temMinimo8Caracteres(): boolean {
    return this.alterarSenhaInfo.novaSenha.length >= 8;
  }

  temMaiuscula(): boolean {
    return /[A-Z]/.test(this.alterarSenhaInfo.novaSenha);
  }

  temMinuscula(): boolean {
    return /[a-z]/.test(this.alterarSenhaInfo.novaSenha);
  }

  temNumero(): boolean {
    return /\d/.test(this.alterarSenhaInfo.novaSenha);
  }

  temSimbolo(): boolean {
    return /[@$!%*?&]/.test(this.alterarSenhaInfo.novaSenha);
  }

  senhasIguais(): boolean {
    return (
      this.alterarSenhaInfo.novaSenha === this.alterarSenhaInfo.confirmarSenha
    );
  }

  formularioValido(): boolean {
    return this.validarSenha() && this.senhasIguais();
  }

  async onAlterarSenha() {
    if (!this.formularioValido()) {
      alert('Por favor, verifique os dados informados.');
      return;
    }

    await this.loadingService.show();

    this.accountService
      .alterarSenha(this.alterarSenhaInfo.novaSenha)
      .subscribe({
        next: (res) => {
          this.loadingService.hide();
          alert('Senha alterada com sucesso!');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.loadingService.hide();
          alert(
            'Erro ao alterar senha. Verifique se a senha atual está correta.'
          );
          console.error('Erro ao alterar senha:', err);
        },
      });
  }

  onCancelar() {
    this.router.navigate(['/login']);
  }
}
