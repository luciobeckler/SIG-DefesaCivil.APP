export interface IAnexo {
  id: string;
  nomeOriginal: string;
  urlArmazenamento: string;
  tipoConteudo: string;
  tamanhoBytes: number;
  file: File;
  latitudeCaptura?: string;
  longitudeCaptura?: string;
  dataHoraCaptura?: Date | string;
  marcadoParaExcluir: boolean;
}

export interface INovoAnexo {
  file: File;
  nome: string;
  tamanho: string;
  latitudeCaptura?: string;
  longitudeCaptura?: string;
  dataHoraCaptura?: Date | string;
}
