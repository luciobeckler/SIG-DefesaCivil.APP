import { IOcorrencia } from './IOcorrencias';

export interface IEtapa extends ICriarOuAtualizarEtapa {
  id: string;
  ocorrencias: IOcorrencia[];
}

interface ICriarOuAtualizarEtapa extends IRegrasDeTransicaoEtapa {
  nome: string;
  descricao: string;
  posicao: number;
  quadroId: string;
}

interface IRegrasDeTransicaoEtapa {
  minTempoNaEtapa: TimeRanges;
  maxTempoNaEtapa: TimeRanges;
  etapasDestinoId: string[];
  permissoesParaTransicionarParaEstaEtapa: string[];
}
