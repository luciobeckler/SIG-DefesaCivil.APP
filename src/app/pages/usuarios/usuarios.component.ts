import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { IUsuarioInfoId } from 'src/app/interfaces/usuario/IUsuarioInfo';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import {
  isCpfValido,
  isTelefoneValido,
  toDateOnly,
} from 'src/app/helper/funcions';
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
import { AlertService } from 'src/app/services/alert/alert.service';
import { ToastService } from 'src/app/services/toast/toast.service';

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
  private usuarioService = inject(UsuariosService);
  private loadingService = inject(LoadingService);
  private alertService = inject(AlertService);
  private toastService = inject(ToastService);

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
    permissao: 'AgenteDeCampo',
    isAtivo: true,
  };
  mostrarModal = false;
  isCreaterOrEdit: boolean = true;
  minDate: string;
  maxDate: string;
  dataNascimentoString: string = '';
  dataAdmissaoString: string = '';

  constructor() {
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
      this.usuarioSelecionado.dataDeNascimento,
    );
    this.dataAdmissaoString = this.formatDateToInput(
      this.usuarioSelecionado.dataAdmissao,
    );

    this.mostrarModal = true;
  }

  private convertStringToDate(
    dateString: string | null | undefined,
  ): Date | null {
    if (!dateString) return null;

    const cleanDate = dateString.replace(/\D/g, '');

    if (cleanDate.length === 8) {
      const day = cleanDate.substring(0, 2);
      const month = cleanDate.substring(2, 4);
      const year = cleanDate.substring(4, 8);

      const date = new Date(`${year}-${month}-${day}T00:00:00`);

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
      this.toastService.showToast(
        'Data Inválida: Data de Nascimento inválida. Use o formato DD/MM/YYYY.',
        'warning',
        'top',
      );
      return;
    }
    if (this.dataAdmissaoString && !dataAdmiObj) {
      this.toastService.showToast(
        'Data Inválida: Data de Admissão inválida. Use o formato DD/MM/YYYY.',
        'warning',
        'top',
      );
      return;
    }

    this.usuarioSelecionado.dataDeNascimento = dataNascObj;
    this.usuarioSelecionado.dataAdmissao = dataAdmiObj;

    if (!this.validarCPF(this.usuarioSelecionado.cpf)) {
      this.toastService.showToast(
        'CPF Inválido: O CPF informado não é válido.',
        'warning',
        'top',
      );
      return;
    }
    if (!this.validarTelefone(this.usuarioSelecionado.telefone)) {
      this.toastService.showToast(
        'Telefone Inválido: Telefone inválido! Informe DDD + número.',
        'warning',
        'top',
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
      permissao: 'AgenteDeCampo',
      isAtivo: true,
    };
    this.dataNascimentoString = '';
    this.dataAdmissaoString = '';
  }

  async confirmarExclusao(user: IUsuarioInfoId) {
    const header = 'Confirmar exclusão';
    const message = `Tem certeza que deseja excluir o usuário "${user.nome.toUpperCase()}"?`;
    if (this.alertService.showConfirmationAlert(header, message).valueOf()) {
      this.onDeleteUser(user);
    }
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
        this.toastService.showToast(
          `Sucesso: Usuário ${user.nome} editado com sucesso.`,
          'success',
          'top',
        );
        this.mostrarModal = false;
        this.loadingService.hide();
      },
      error: (err) => {
        this.toastService.showToast(
          `Erro ${err.error.message}`,
          'danger',
          'top',
        );
        this.loadingService.hide();
      },
    });
  }

  async onDeleteUser(user: IUsuarioInfoId) {
    this.loadingService.show();

    this.usuarioService.delete(user.id).subscribe({
      next: () => {
        this.getOutrosUsuarios();
        this.toastService.showToast(
          `Sucesso: Usuário ${user.nome} deletado com sucesso.`,
          'success',
          'top',
        );
        this.loadingService.hide();
      },
      error: (err) => {
        this.toastService.showToast(
          `Erro: ${err.error.message}`,
          'danger',
          'top',
        );
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
        this.toastService.showToast(
          `Sucesso: ${resposta.message}`,
          `success`,
          `top`,
        );
        this.fecharModal();
        this.loadingService.hide();
      },
      error: (err) => {
        this.toastService.showToast(
          `Erro: ${err.error.message}`,
          `danger`,
          `top`,
        );
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
