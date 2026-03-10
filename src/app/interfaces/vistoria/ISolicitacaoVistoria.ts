import { IEndereco } from '../shared/IEndereco';
import { ISolicitante } from '../shared/ISolicitante';

export interface ISolicitacaoVistoria {
  solicitante: ISolicitante;
  localizacao: IEndereco;
}
