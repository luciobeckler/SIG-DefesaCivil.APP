import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IUsuarioInfoId } from 'src/app/interfaces/usuario/IUsuarioInfo';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import {
  isCpfValido,
  isTelefoneValido,
  toDateOnly,
} from 'src/app/helper/funcions';
import { AlertController } from '@ionic/angular';
import { LoadingService } from 'src/app/services/loading.service';
import { NgxMaskDirective } from 'ngx-mask';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonGrid,
  IonRow,
  IonCol,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonItem,
  IonText,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToggle,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonGrid,
    IonRow,
    IonCol,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonItem,
    IonText,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonToggle,
    FormsModule,
    NgxMaskDirective,
  ],
})
export class UsuariosComponent implements OnInit {
  usuarios: IUsuarioInfoId[] = [];
  usuarioSelecionado: IUsuarioInfoId = {
    id: '',
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    endereco: '',
    dataAdmissao: null,
    dataDeNascimento: null,
    cargo: '',
    permissao: 'Usuário de campo',
    isAtivo: true,
  };
  mostrarModal = false;
  isCreaterOrEdit: boolean = true;
  minDate: string;
  maxDate: string;
  dataNascimentoString: string = '';
  dataAdmissaoString: string = '';

  constructor(
    private alertController: AlertController,
    private usuarioService: UsuariosService,
    private loadingService: LoadingService
  ) {
    const today = new Date();
    const max = today.toISOString();

    const pastDate = new Date();
    pastDate.setFullYear(today.getFullYear() - 120);
    const min = pastDate.toISOString();

    this.minDate = min;
    this.maxDate = max;
  }

  ngOnInit() {
    this.getOutrosUsuarios();
  }

  abrirModalUsuario(userSelected?: IUsuarioInfoId) {
    const userCopia = structuredClone(userSelected);

    if (userCopia) {
      this.usuarioSelecionado = userCopia;
      this.isCreaterOrEdit = false;
    } else {
      this.resetarUsuario();
      this.isCreaterOrEdit = true;
    }

    this.dataNascimentoString = this.formatDateToInput(
      this.usuarioSelecionado.dataDeNascimento
    );
    this.dataAdmissaoString = this.formatDateToInput(
      this.usuarioSelecionado.dataAdmissao
    );

    this.mostrarModal = true;
  }

  private convertStringToDate(
    dateString: string | null | undefined
  ): Date | null {
    if (!dateString) return null;

    const parts = dateString.split('/');
    if (parts.length === 3) {
      const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    return null;
  }

  private formatDateToInput(date: Date | string | null | undefined): string {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return '';

    const day = ('0' + dateObj.getUTCDate()).slice(-2);
    const month = ('0' + (dateObj.getUTCMonth() + 1)).slice(-2);
    const year = dateObj.getUTCFullYear();

    return `${day}/${month}/${year}`;
  }

  onSaveModal() {
    const dataNascObj = this.convertStringToDate(this.dataNascimentoString);
    const dataAdmiObj = this.convertStringToDate(this.dataAdmissaoString);

    if (this.dataNascimentoString && !dataNascObj) {
      this.presentAlert(
        'Data Inválida',
        'Data de Nascimento inválida. Use o formato DD/MM/YYYY.'
      );
      return;
    }
    if (this.dataAdmissaoString && !dataAdmiObj) {
      this.presentAlert(
        'Data Inválida',
        'Data de Admissão inválida. Use o formato DD/MM/YYYY.'
      );
      return;
    }

    this.usuarioSelecionado.dataDeNascimento = dataNascObj;
    this.usuarioSelecionado.dataAdmissao = dataAdmiObj;

    if (!this.validarCPF(this.usuarioSelecionado.cpf)) {
      this.presentAlert('CPF Inválido', 'O CPF informado não é válido.');
      return;
    }
    if (!this.validarTelefone(this.usuarioSelecionado.telefone)) {
      this.presentAlert(
        'Telefone Inválido',
        'Telefone inválido! Informe DDD + número.'
      );
      return;
    }

    if (this.isCreaterOrEdit) {
      this.onCreateUser();
    } else {
      this.onEditUser(this.usuarioSelecionado);
    }
  }

  fecharModal() {
    this.mostrarModal = false;
  }

  resetarUsuario() {
    this.usuarioSelecionado = {
      id: '',
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      endereco: '',
      dataDeNascimento: null,
      dataAdmissao: null,
      cargo: '',
      permissao: 'Usuário de campo',
      isAtivo: true,
    };
    this.dataNascimentoString = '';
    this.dataAdmissaoString = '';
  }

  async presentAlert(header: string, message: string, subHeader?: string) {
    const alert = await this.alertController.create({
      header: header,
      subHeader: subHeader,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async confirmarExclusao(user: IUsuarioInfoId) {
    const alert = await this.alertController.create({
      header: 'Confirmar exclusão',
      message: `Tem certeza que deseja excluir o usuário "${user.nome.toUpperCase()}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.onDeleteUser(user);
          },
        },
      ],
    });

    await alert.present();
  }

  async getOutrosUsuarios() {
    this.loadingService.show('Carregando usuários...');
    this.resetarUsuario();

    this.usuarioService.getOutrosUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        console.log(this.usuarios);
        this.loadingService.hide();
      },
      error: (err) => {
        console.error('Erro ao carregar usuários', err);
        this.loadingService.hide();
      },
    });
  }

  async onEditUser(user: IUsuarioInfoId) {
    this.loadingService.show();

    const { id, ...rest } = this.usuarioSelecionado;

    const payload = {
      ...rest,
      dataAdmissao: toDateOnly(this.usuarioSelecionado.dataAdmissao),
      dataDeNascimento: toDateOnly(this.usuarioSelecionado.dataDeNascimento),
    };

    this.usuarioService.update(id, payload).subscribe({
      next: () => {
        this.getOutrosUsuarios();
        this.presentAlert(
          'Sucesso',
          `Usuário ${user.nome} editado com sucesso.`
        );
        this.mostrarModal = false;
        this.loadingService.hide();
      },
      error: (err) => {
        this.presentAlert('Erro', err.error.message);
        this.loadingService.hide();
      },
    });
  }

  async onDeleteUser(user: IUsuarioInfoId) {
    this.loadingService.show();

    this.usuarioService.delete(user.id).subscribe({
      next: () => {
        this.getOutrosUsuarios();
        this.presentAlert(
          'Sucesso',
          `Usuário ${user.nome} deletado com sucesso.`
        );
        this.loadingService.hide();
      },
      error: (err) => {
        this.presentAlert('Erro', err.error.message);
        this.loadingService.hide();
      },
    });
  }

  async onCreateUser() {
    this.loadingService.show();

    const { id, ...rest } = this.usuarioSelecionado;
    const payload = {
      ...rest,
      dataAdmissao: toDateOnly(this.usuarioSelecionado.dataAdmissao),
      dataDeNascimento: toDateOnly(this.usuarioSelecionado.dataDeNascimento),
    };

    this.usuarioService.create(payload).subscribe({
      next: (resposta) => {
        this.getOutrosUsuarios();
        this.presentAlert('Sucesso', resposta.message);
        this.fecharModal();
        this.loadingService.hide();
      },
      error: (err) => {
        this.presentAlert('Erro', err.error.message);
        this.loadingService.hide();
      },
    });
  }

  validarCPF(cpf: string): boolean {
    return isCpfValido(cpf);
  }

  validarTelefone(telefone: string): boolean {
    return isTelefoneValido(telefone);
  }
}
