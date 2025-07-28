import { NumberUtils } from '@/modules/utils/services/number.utils';
import { Expose, Transform, Type } from 'class-transformer';

export class MeControlsChampionCattleDto {
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
