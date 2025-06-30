import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { IRegister } from 'src/app/interfaces/usuario/IRegister';
import { IUsuarioInfoId } from 'src/app/interfaces/usuario/IUsuarioInfo';
import { UsuariosService } from 'src/app/services/usuarios/usuarios.service';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class UsuariosComponent implements OnInit {
  usuarios: IUsuarioInfoId[] = [];
  novoUsuario: IRegister = {
    nome: '',
    senha: '',
    email: '',
    telefone: '',
    cpf: '',
    endereco: '',
    dataAdmissao: new Date(),
    dataDeNascimento: null,
    cargo: '',
    permissao: 'Usuário de campo',
    isAtivo: true,
  };
  mostrarModal = false;

  constructor(private usuarioService: UsuariosService) {}

  ngOnInit() {
    this.getAllUsers();
  }

  getAllUsers() {
    this.usuarioService.getAll().subscribe({
      next: (data) => {
        this.usuarios = data;
        console.log(this.usuarios);
      },
      error: (err) => {
        console.error('Erro ao carregar usuários', err);
      },
    });
  }
  onCreateUser() {
    this.novoUsuario = {
      nome: '',
      senha: '',
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

    this.fecharModal();
    this.getAllUsers();
  }

  onEditUser(_t23: IUsuarioInfoId) {
    throw new Error('Method not implemented.');
  }
  onDeleteUser(user: IUsuarioInfoId) {
    this.usuarioService.delete(user.id).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter((user) => user.id !== user.id);
        alert(`Usuário ${user.nome} deletado com sucesso.`);
      },
      error: (err) => {
        console.error('Erro ao deletar usuário', err);
      },
    });
  }

  abrirModalAdicionarUsuario() {
    this.mostrarModal = true;
  }

  fecharModal() {
    this.mostrarModal = false;
  }
}
