import {
  EAnalisePreliminar,
  EAreaAfetada,
  ECaracterizacaoLocal,
  EGrauRisco,
  EMotivacao,
  ERegimeOcupacao,
  ETipificacaoOcorrencia,
  ETipoEdificacao,
  ETipoEstrutura,
  ETipoRisco,
} from 'src/app/helper/OcorrenciaEnums';
import { IEndereco } from '../shared/IEndereco';
import { ISolicitante } from '../shared/ISolicitante';

export interface ICamposOcorrencia {
  dataEHoraDoOcorrido?: string;
  dataEHoraInicioAtendimento?: string;
  dataEHoraTerminoAtendimento?: string;

  localizacao?: IEndereco;
  solicitante?: ISolicitante;

  // Campos Single-Select (Fortemente Tipados)
  grauDeRisco?: EGrauRisco;
  regimeDeOcupacaoDoImovel?: ERegimeOcupacao;

  // Campos Multi-Select (Arrays dos Tipos específicos)
  analisePreliminar?: EAnalisePreliminar[];
  caracterizacaoDoLocal?: ECaracterizacaoLocal[];
  edificacao?: ETipoEdificacao[];
  estrutura?: ETipoEstrutura[];
  tipoDeRisco?: ETipoRisco[];
  tipificacaoDaOcorrencia?: ETipificacaoOcorrencia[];
  motivacao?: EMotivacao[];
  areasAfetadas?: EAreaAfetada[];

  // Dados Quantitativos
  possuiIPTU?: string;
  numeroDeMoradias?: number;
  numeroDeComodos?: number;
  numeroDePavimentos?: number;
  possuiUnidadeFamiliar: boolean;
  numeroDeDeficientes?: number;
  numeroDeCriancas?: number;
  numeroDeAdultos?: number;
  numeroDeIdosos?: number;
}
