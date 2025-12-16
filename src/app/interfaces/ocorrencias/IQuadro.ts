import { IEtapa } from './IEtapa';

export interface IQuadro {
  id: string;
  nome: string;
  descricao: string;
}

export interface IQuadroDetalhes extends IQuadro {
  etapas: IEtapa[];
}
