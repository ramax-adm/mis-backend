import { NumberUtils } from '@/services/utils/number.utils';
import { IsNumber } from 'class-validator';

export class ProjectOperationClosureResponseDto {
  @IsNumber()
  saidas: number;
  @IsNumber()
  entradas: number;
  @IsNumber()
  fechamento: number;

  static getData(raw: ProjectOperationClosureResponseDto) {
    return {
      saidas: NumberUtils.toLocaleString(raw.saidas),
      entradas: NumberUtils.toLocaleString(raw.entradas),
      fechamento: NumberUtils.toLocaleString(raw.fechamento),
    };
  }
}
