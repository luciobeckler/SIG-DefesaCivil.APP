import { EStatus } from 'src/app/helper/statusEnum';
import { INaturezaResumo } from '../naturezas/INatureza';
import { IAnexo } from '../anexos/IAnexos';

export interface IOcorrenciaPreview extends IOcorrenciaBase {
  emailResponsavel: string;
}

export interface IOcorrenciaDetalhes extends IOcorrenciaBase {
  descricao: string;
  endereco: string;
  dataEHoraDoEvento: string;
  eventoPai: IOcorrenciaPreview | null;
  subEventos: IOcorrenciaPreview[];
  usuarioCriador: IOcorrenciaDetalhesUsuario;
  anexos: IAnexo[];
}

export interface IOcorrenciaDetalhesUsuario {
  id: string;
  nome: string;
  email: string;
}

export interface IOcorrenciaBase {
  id: string;
  codigo: string;
  titulo: string;
  status: EStatus;
  naturezas: INaturezaResumo[];
}
