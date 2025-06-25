import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonList,
  ],
  styleUrls: ['./usuarios.component.scss'],
})
export class UsuariosComponent {
  userForm: FormGroup;
  users: any[] = [];
  editingIndex: number | null = null;

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      nome: ['', Validators.required],
      nascimento: ['', Validators.required],
      admissao: ['', Validators.required],
      cpf: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', Validators.required],
      endereco: ['', Validators.required],
      cargo: ['', Validators.required],
      permissoes: [[]],
    });
  }

  salvar() {
    if (this.userForm.invalid) return;

    if (this.editingIndex !== null) {
      this.users[this.editingIndex] = this.userForm.value;
      this.editingIndex = null;
    } else {
      this.users.push(this.userForm.value);
    }

    this.userForm.reset();
  }

  editar(index: number) {
    this.userForm.setValue(this.users[index]);
    this.editingIndex = index;
  }

  deletar(index: number) {
    this.users.splice(index, 1);
    if (this.editingIndex === index) {
      this.userForm.reset();
      this.editingIndex = null;
    }
  }
}
