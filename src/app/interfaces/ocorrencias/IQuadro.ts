import { IEtapa } from './IEtapa';

export interface IQuadro {
  id: string;
  nome: string;
  descricao: string;
  etapas: IEtapa[];
}
