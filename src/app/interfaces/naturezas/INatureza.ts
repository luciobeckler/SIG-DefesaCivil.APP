export interface INatureza {
  id: string;
  nome: string;
  codigoNatureza: string;
  naturezaPaiId: string | null;
  subNaturezas: INatureza[];
}

export interface ISendNatureza {
  nome: string;
  codigoNatureza: string;
  codigoNaturezaPai?: string;
}
