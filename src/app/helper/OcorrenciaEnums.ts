export const EAnalisePreliminar = {
  Sim: 'Sim',
  Nao: 'Nao',
  Vistoria: 'Vistoria',
  Orientacao: 'Orientacao',
  Arquivamento: 'Arquivamento',
  Outros: 'Outros',
} as const;

export const ECaracterizacaoLocal = {
  Encosta: 'Encosta',
  FundoDeVale: 'FundoDeVale',
  CorregoRio: 'CorregoRio',
  Aterro: 'Aterro',
  DeCorte: 'DeCorte',
} as const;

export const ETipoEdificacao = {
  Barracao: 'Barracao',
  Casa: 'Casa',
  Predio: 'Predio',
  Outros: 'Outros',
} as const;

export const ETipoEstrutura = {
  Alvenaria: 'Alvenaria',
  Madeira: 'Madeira',
  ConcretoArmado: 'ConcretoArmado',
  PreFabricado: 'PreFabricado',
  OutrosMateriais: 'OutrosMateriais',
} as const;

export const ETipoRisco = {
  Construtivo: 'Construtivo',
  Geologico: 'Geologico',
  Biologico: 'Biologico',
  Outros: 'Outros',
} as const;

export const EGrauRisco = {
  MuitoAlto: 'MuitoAlto',
  Alto: 'Alto',
  Medio: 'Medio',
  Baixo: 'Baixo',
} as const;

export const ERegimeOcupacao = {
  Proprio: 'Proprio',
  Alugado: 'Alugado',
  Outros: 'Outros',
} as const;

export const ETipificacaoOcorrencia = {
  Escorregamento: 'Escorregamento',
  Trincas: 'Trincas',
  DegrauDeAbatimento: 'DegrauDeAbatimento',
  InundacaoDeCorrego: 'InundacaoDeCorrego',
  Incendio: 'Incendio',
  Solapamento: 'Solapamento',
  CicatrizDeEscorregamento: 'CicatrizDeEscorregamento',
  Erosao: 'Erosao',
  Alagamento: 'Alagamento',
  AbatimentoDeFossa: 'AbatimentoDeFossa',
  RedePublicaDeDrenagemPluvialRompida: 'RedePublicaDeDrenagemPluvialRompida',
  RolamentoTombamentoDeBlocos: 'RolamentoTombamentoDeBlocos',
} as const;

export const EMotivacao = {
  Rachaduras: 'Rachaduras',
  Infiltracao: 'Infiltracao',
  MovimentacaoDeSolo: 'MovimentacaoDeSolo',
  Arvore: 'Arvore',
  DesabamentoTotal: 'DesabamentoTotal',
  DesabamentoParcial: 'DesabamentoParcial',
  PrecarioInsalubre: 'PrecarioInsalubre',
  Encosta: 'Encosta',
  LancamentoDeAguaPluvialEsgoto: 'LancamentoDeAguaPluvialEsgoto',
  LancamentoDeLixoEntulhoAterro: 'LancamentoDeLixoEntulhoAterro',
  DesprendimentoDeReboco: 'DesprendimentoDeReboco',
  InexistenciaInsuficienciaDeDrenagemPluvial:
    'InexistenciaInsuficienciaDeDrenagemPluvial',
  Outros: 'Outros',
} as const;

export const EAreaAfetada = {
  Residencia: 'Residencia',
  Muro: 'Muro',
  Ponte: 'Ponte',
} as const;

export type EAnalisePreliminar =
  (typeof EAnalisePreliminar)[keyof typeof EAnalisePreliminar];
export type ECaracterizacaoLocal =
  (typeof ECaracterizacaoLocal)[keyof typeof ECaracterizacaoLocal];
export type ETipoEdificacao =
  (typeof ETipoEdificacao)[keyof typeof ETipoEdificacao];
export type ETipoEstrutura =
  (typeof ETipoEstrutura)[keyof typeof ETipoEstrutura];
export type ETipoRisco = (typeof ETipoRisco)[keyof typeof ETipoRisco];
export type EGrauRisco = (typeof EGrauRisco)[keyof typeof EGrauRisco];
export type ERegimeOcupacao =
  (typeof ERegimeOcupacao)[keyof typeof ERegimeOcupacao];
export type ETipificacaoOcorrencia =
  (typeof ETipificacaoOcorrencia)[keyof typeof ETipificacaoOcorrencia];
export type EMotivacao = (typeof EMotivacao)[keyof typeof EMotivacao];
export type EAreaAfetada = (typeof EAreaAfetada)[keyof typeof EAreaAfetada];

// 3. Helper para Dropdowns (Ion-Select)
// Usado para gerar as listas de opções automaticamente:
// Ex: opcoesRisco = enumToArray(EGrauRisco);
export function enumToArray(enumObj: any): string[] {
  return Object.values(enumObj);
}
