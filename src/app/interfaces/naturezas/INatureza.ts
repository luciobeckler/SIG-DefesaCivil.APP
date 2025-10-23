export interface IViewNatureza {
  id: string;
  nome: string;
  codigoNatureza: string;
}

export interface INatureza extends IViewNatureza {
  naturezaPaiId: string | null;
  subNaturezas: INatureza[];
}

export interface ISendNatureza {
  nome: string;
  codigoNatureza: string;
  codigoNaturezaPai?: string;
}
