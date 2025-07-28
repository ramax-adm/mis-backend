import { NumberUtils } from '@/modules/utils/services/number.utils';
import { Expose, Transform } from 'class-transformer';

export class RawMaterialControlsChampionCattleDto {
  @Expose()
  cbs: number;

  @Expose()
  pesoArroba: number;

  @Expose()
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pTr: number;

  @Expose()
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pDt: number;

  @Expose()
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pPa: number;

  @Expose()
  precoArroba: number;

  @Expose()
  precoFreteKg: number;
}
