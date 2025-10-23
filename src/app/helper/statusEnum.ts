export enum EStatus {
  Pendente = 'Pendente',
  EmAnalise = 'EmAnalise',
  EmAtendimento = 'EmAtendimento',
  EmMonitoramento = 'EmMonitoramento',
  Finalizado = 'Finalizado',
  Cancelado = 'Cancelado',
}

// Opcional: Tipo para garantir que só strings válidas sejam aceitas se não usar enum
export type EStatusStrings =
  | 'Pendente'
  | 'EmAnalise'
  | 'EmAtendimento'
  | 'EmMonitoramento'
  | 'Finalizado'
  | 'Cancelado';
