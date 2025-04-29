import { NumberUtils } from '@/services/utils/number.utils';
import { Expose, Transform } from 'class-transformer';

export class RawMaterialControlsDto {
  @Expose()
  cbsMe: number;

  @Expose()
  cbsMi: number;

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
  precoArrobaMe: number;

  @Expose()
  precoArrobaMi: number;

  @Expose()
  precoFreteKg: number;

  @Expose()
  diasPagamentoFrete: number;

  @Expose()
  diasPagamento: number;
}
