export interface IHistoricoOcorrenciaDTO {
  id: string;
  ocorrenciaId: string;
  usuarioId: string;
  usuarioNome: string;
  acao: string;
  horarios: string[];
}
