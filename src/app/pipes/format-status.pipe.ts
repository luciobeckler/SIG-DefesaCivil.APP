import { Pipe, PipeTransform } from '@angular/core';
import { EStatus, EStatusStrings } from '../helper/statusEnum';

@Pipe({
  name: 'formatStatus',
  standalone: true,
})
export class FormatStatusPipe implements PipeTransform {
  transform(
    value: EStatus | EStatusStrings | string | null | undefined
  ): string {
    if (value === null || value === undefined) {
      return 'N/D';
    }

    const statusKey = value.toString();

    switch (statusKey) {
      case EStatus.Pendente:
        return 'Pendente';
      case EStatus.EmAnalise:
        return 'Em Análise';
      case EStatus.EmAtendimento:
        return 'Em Atendimento';
      case EStatus.EmMonitoramento:
        return 'Em Monitoramento';
      case EStatus.Finalizado:
        return 'Finalizado';
      case EStatus.Cancelado:
        return 'Cancelado';
      default:
        console.warn(`Status desconhecido recebido pelo pipe: ${value}`);
        return statusKey;
    }
  }
}
