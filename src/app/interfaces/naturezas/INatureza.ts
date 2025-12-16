export interface INaturezaResumo {
  id: string;
  nome: string;
  codigoNatureza: string;
}

export interface INatureza extends INaturezaResumo {
  naturezaPaiId: string | null;
  subNaturezas: INatureza[];
}

export interface ISendNatureza {
  nome: string;
  codigoNatureza: string;
  codigoNaturezaPai?: string;
}
