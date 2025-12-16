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

//https://www.linkedin.com/posts/emmanuelchika_never-use-enums-in-typescript-but-heres-activity-7404149183227744256-Vmb2?utm_source=social_share_send&utm_medium=android_app&rcm=ACoAAC8Xm2IBwXFW9HbeCKJVYAQTJLCENrDD2B4&utm_campaign=whatsapp
