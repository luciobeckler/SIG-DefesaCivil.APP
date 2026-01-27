export interface IRegister {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  cargo: string;
  permissao: 'AgenteDeCampo' | 'Diretor' | 'Administrador';
  isAtivo: boolean;

  //Dados opcionais
  endereco: string | null;
  dataDeNascimento: Date | null;
  dataAdmissao: Date | null;
}
