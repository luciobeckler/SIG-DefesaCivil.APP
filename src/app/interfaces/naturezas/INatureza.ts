export interface INaturezaResumo {
  id: string;
  nome: string;
  codigoNatureza: string;
  descricao?: string;
}

export interface INatureza extends INaturezaResumo {
  naturezaPaiId: string | null;
  subNaturezas: INatureza[];
  ehFolha: boolean;
}

export interface ISendNatureza {
  nome: string;
  codigoNatureza: string;
  descricao?: string;
  codigoNaturezaPai?: string;
}
