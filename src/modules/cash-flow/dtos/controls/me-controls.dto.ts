import { NumberUtils } from '@/modules/utils/services/number.utils';
import { Expose, Transform, Type } from 'class-transformer';

export class MeControlsDto {
  @Expose()
  @Type(() => Number)
  vendasMeDias: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pAntecipacaoMe: number;

  @Expose()
  @Type(() => Number)
  diasPosicao: number;

  @Expose()
  @Type(() => Number)
  ptax: number;

  @Expose()
  @Type(() => Number)
  precoFreteRodoviario: number;

  @Expose()
  @Type(() => Number)
  precoPorto: number;

  @Expose()
  @Type(() => Number)
  precoFreteInter: number;

  @Expose()
  @Type(() => Number)
  precoFinanc: number;
}
