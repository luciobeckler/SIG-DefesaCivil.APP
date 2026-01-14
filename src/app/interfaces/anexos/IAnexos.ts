export interface IAnexo {
  id?: string;
  nomeOriginal: string;
  urlArmazenamento?: string;
  tipoConteudo: string;
  tamanhoBytes: number;
  file?: File;
  marcadoParaExcluir?: boolean;
}

export interface INovoAnexo {
  file: File;
  nome: string; // Permite edição
  tamanho: string;
}
