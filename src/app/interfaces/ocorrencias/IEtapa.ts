import { IOcorrencia } from './IOcorrencias';

export interface IEtapa extends IRegrasDeTransicaoEtapa {
  id: string;
  nome: string;
  descricao: string;
  posicao: number;
  quadroId: string;

  ocorrencias: IOcorrencia[];
}

interface IRegrasDeTransicaoEtapa {
  minTempoNaEtapa: TimeRanges;
  etapasDestinoId: string[];
  permissoesParaTransicionarParaEstaEtapa: string[];
}
