import { EStatus } from 'src/app/helper/statusEnum';
import { IViewNatureza } from '../naturezas/INatureza';

export interface IEventoPreview extends IEventoBase {
  emailResponsavel: string;
}

export interface IEventoDetalhes extends IEventoBase {
  descricao: string;
  endereco: string;
  dataEHoraDoEvento: string;
  eventoPai: IEventoPreview | null;
  subEventos: IEventoPreview[];
  usuarioCriador: IEventoDetalhesUsuario;
}

export interface IEventoDetalhesUsuario {
  id: string;
  nome: string;
  email: string;
}

export interface IEventoBase {
  id: string;
  codigo: string;
  titulo: string;
  status: EStatus;
  naturezas: IViewNatureza[];
}
