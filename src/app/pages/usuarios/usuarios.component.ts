import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IUsuarioInfoId } from 'src/app/interfaces/usuario/IUsuarioInfo';
import { UsuariosService } from 'src/app/services/usuarios/usuarios.service';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { isCpfValido, isTelefoneValido, toDateOnly } from 'src/app/helper/funcions';
import { AlertController } from '@ionic/angular';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
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
  maxDate: string ;

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
    this.mostrarModal = true;
  }

  onSaveModal() {
    // Validação extra antes de salvar
    if (!this.validarCPF(this.usuarioSelecionado.cpf)) {
      alert('CPF inválido!');
      return;
    }
    if (!this.validarTelefone(this.usuarioSelecionado.telefone)) {
      alert('Telefone inválido! Informe DDD + número.');
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
      dataAdmissao: new Date(),
      cargo: '',
      permissao: 'Usuário de campo',
      isAtivo: true,
    };
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
        alert(`Usuário ${user.nome} editado com sucesso.`);
        this.mostrarModal = false;
        this.loadingService.hide();
      },
      error: (err) => {
        alert(`Erro ao editar os dados do usuário ${user.nome}.`);
        this.loadingService.hide();
      },
    });
  }

  async onDeleteUser(user: IUsuarioInfoId) {
    this.loadingService.show();

    this.usuarioService.delete(user.id).subscribe({
      next: () => {
        this.getOutrosUsuarios();
        alert(`Usuário ${user.nome} deletado com sucesso.`);
        this.loadingService.hide();
      },
      error: (err) => {
        console.error('Erro ao deletar usuário', err);
        alert(`Erro ao deletar o usuário ${user.nome}.`);
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
        alert(resposta.message);
        this.fecharModal();
        this.loadingService.hide();
      },
      error: (erro) => {
        console.log('Erro ao criar o usuário:', erro);
        alert(erro.error);
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
