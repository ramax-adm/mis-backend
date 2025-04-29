import { NumberUtils } from '@/services/utils/number.utils';
import { Expose, Transform, Type } from 'class-transformer';

export class MiControlsDto {
  @Expose()
  @Type(() => Number)
  vendasMiDias: number;

  @Expose()
  @Type(() => Number)
  precoFreteMi: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pImpostosMi: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pComissoesMi: number;
}
