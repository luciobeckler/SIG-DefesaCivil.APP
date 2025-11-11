export interface IAnexo {
  id?: string;
  nomeOriginal: string;
  urlArmazenamento?: string;
  tipoConteudo?: string;
  tamanhoBytes?: number;
  file?: File;
  marcadoParaExcluir?: boolean;
}
