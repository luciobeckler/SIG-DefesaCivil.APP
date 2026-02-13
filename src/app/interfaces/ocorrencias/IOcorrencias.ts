import { IAnexo as IAnexoDTO } from '../anexos/IAnexos';
import { INatureza, INaturezaResumo } from '../naturezas/INatureza';
import { IDetalhesUsuarioDTO } from '../usuario/IDetalhesUsuario';
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
} from '../../helper/OcorrenciaEnums';

// --- DTO Base ---
export interface IOcorrenciaDadosBaseDTO {
  dataEHoraDoOcorrido: string | null;
  dataEHoraInicioAtendimento: string | null;
  dataEHoraTerminoAtendimento: string | null;

  // Endereço
  enderecoRua: string | null;
  enderecoNumero: string | null;
  enderecoComplemento: string | null;
  enderecoBairro: string | null;
  enderecoCEP: string | null;

  // Solicitante
  solicitanteNome: string | null;
  solicitanteCPF: string | null;
  solicitanteRG: string | null;

  // Dados Quantitativos
  possuiIPTU: string | null;
  numeroDeMoradias: number | null;
  numeroDeComodos: number | null;
  numeroDePavimentos: number | null;
  possuiUnidadeFamiliar: boolean;
  numeroDeDeficientes: number | null;
  numeroDeCriancas: number | null;
  numeroDeAdultos: number | null;
  numeroDeIdosos: number | null;
}

// --- DTO de Entrada ---
export interface ICreateOrEditOcorrenciaDTO extends IOcorrenciaDadosBaseDTO {
  // Campos Single-Select (Fortemente Tipados)
  grauDeRisco: EGrauRisco | null;
  regimeDeOcupacaoDoImovel: ERegimeOcupacao | null;

  // Campos Multi-Select (Arrays dos Tipos específicos)
  analisePreliminar: EAnalisePreliminar[] | null;
  caracterizacaoDoLocal: ECaracterizacaoLocal[] | null;
  edificacao: ETipoEdificacao[] | null;
  estrutura: ETipoEstrutura[] | null;
  tipoDeRisco: ETipoRisco[] | null;
  tipificacaoDaOcorrencia: ETipificacaoOcorrencia[] | null;
  motivacao: EMotivacao[] | null;
  areasAfetadas: EAreaAfetada[] | null;

  // Relacionamentos
  ocorrenciaPaiId: string | null;
  subOcorrenciasId: string[] | null;
  naturezasId: string[] | null;
}

// --- DTO de Saída ---
export interface IOcorrencia extends IOcorrenciaDadosBaseDTO {
  id: string;
  numero: number;
  isVisible: boolean;
  dataEntradaNaFaseAtual: string | null;

  usuarioCriador: IDetalhesUsuarioDTO;

  // Single-Select Tipados
  grauDeRisco: EGrauRisco;
  regimeDeOcupacaoDoImovel: ERegimeOcupacao | null;

  // Multi-Select Tipados
  analisePreliminar: EAnalisePreliminar[];
  caracterizacaoDoLocal: ECaracterizacaoLocal[];
  edificacao: ETipoEdificacao[];
  estrutura: ETipoEstrutura[];
  tipoDeRisco: ETipoRisco[];
  tipificacaoDaOcorrencia: ETipificacaoOcorrencia[];
  motivacao: EMotivacao[];
  areasAfetadas: EAreaAfetada[];
  anexos: IAnexoDTO[];
  naturezas: INaturezaResumo[];
}

export interface IHistoricoOcorrenciaDTO {
  id: string;
  ocorrenciaId: string;
  usuarioId: string;
  usuarioNome: string;
  acao: string;
  horarios: string[];
}
