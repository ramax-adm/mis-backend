import { Expose, Type } from 'class-transformer';

export class OperationControlsChampionCattleDto {
  @Expose()
  @Type(() => Number)
  arredKg: number;

  @Expose()
  @Type(() => String)
  tipoArrend: string;

  @Expose()
  @Type(() => Number)
  precoEmbalagem: number;

  @Expose()
  @Type(() => Number)
  precoMod: number;
}
