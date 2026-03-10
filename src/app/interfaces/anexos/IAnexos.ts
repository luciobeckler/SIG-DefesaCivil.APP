import { IEndereco } from '../shared/IEndereco';

export interface IAnexo {
  file: File;

  id: string;
  nomeOriginal: string;
  urlArmazenamento: string;
  localizacao: IEndereco | null;
  dataHoraCaptura?: string;

  marcadoParaExcluir: boolean;
}

export interface IListaDeAnexos {
  tipoEntidade: 'Ocorrencia';
  anexos: IAnexoUpload[];
}

export interface IAnexoUpload {
  file: File;
  localizacao: IEndereco;
  dataHoraCaptura?: string;
}

export interface IRemocaoAnexos {
  idsAnexos: string[];
}

export interface IAnexoOffiline extends IAnexo {
  isUpdate: boolean;
}
