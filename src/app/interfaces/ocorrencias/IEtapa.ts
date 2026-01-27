import { IOcorrenciaPreviewDTO } from './IOcorrencias';

export interface IEtapa extends IRegrasDeTransicaoEtapa {
  id: string;
  nome: string;
  descricao: string;
  posicao: number;
  quadroId: string;

  ocorrencias: IOcorrenciaPreviewDTO[];
}

interface IRegrasDeTransicaoEtapa {
  minTempoNaEtapa: TimeRanges;
  etapasDestinoId: string[];
  permissoesParaTransicionarParaEstaEtapa: string[];
}
