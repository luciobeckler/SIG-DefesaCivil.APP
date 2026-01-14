import { EGrauRisco, ETipoRisco } from './OcorrenciaEnums';

export interface IVisualConfig {
  color: string;
  icon: string;
}

export const GrauRiscoVisual: Record<string, IVisualConfig> = {
  [EGrauRisco.MuitoAlto]: { color: 'danger', icon: 'alert-circle' },
  [EGrauRisco.Alto]: { color: 'warning', icon: 'warning' },
  [EGrauRisco.Medio]: { color: 'primary', icon: 'thermometer' },
  [EGrauRisco.Baixo]: { color: 'success', icon: 'shield-checkmark' },
  default: { color: 'medium', icon: 'help-circle' },
};

export const TipoRiscoVisual: Record<string, IVisualConfig> = {
  [ETipoRisco.Geologico]: { color: 'warning', icon: 'earth' },
  [ETipoRisco.Construtivo]: { color: 'danger', icon: 'hammer' },
  [ETipoRisco.Biologico]: { color: 'success', icon: 'leaf' },
  [ETipoRisco.Outros]: { color: 'medium', icon: 'ellipsis-horizontal-circle' },
  default: { color: 'medium', icon: 'alert' },
};

export function getVisual(
  map: Record<string, IVisualConfig>,
  key: string | null
): IVisualConfig {
  if (!key || !map[key]) return map['default'];
  return map[key];
}
