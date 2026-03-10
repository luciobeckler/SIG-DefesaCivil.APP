import { IAnexo as IAnexoDTO } from '../anexos/IAnexos';
import { INaturezaResumo } from '../naturezas/INatureza';
import { IResponsavel } from '../usuario/IDetalhesUsuario';

import { ICamposOcorrencia } from './ICamposOcorrencia';

// --- DTO de Entrada ---
export interface ICreateOrEditOcorrenciaDTO {
  tipoCadastro: 'Urgente' | 'Basica' | 'Completa';
  campos: ICamposOcorrencia;
}

// --- DTO de Saída ---
export interface IOcorrencia {
  id: string;
  protocolo: number;
  isVisible: boolean;
  dataEntradaNaFaseAtual: string | null;
  responsavel: IResponsavel | null;
  campos: ICamposOcorrencia;
  anexos: IAnexoDTO[];
}
