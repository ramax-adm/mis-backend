import { Expose, Type } from 'class-transformer';
import { MeControlsDto } from '../../controls/me-controls.dto';
import { MeIncomeControlsDto } from '../../controls/me-income-controls.dto';
import { MePricesControlsDto } from '../../controls/me-prices-controls.dto';
import { MiControlsDto } from '../../controls/mi-controls.dto';
import { MiIncomeControlsDto } from '../../controls/mi-income-controls.dto';
import { MiPricesControlsDto } from '../../controls/mi-prices-controls.dto';
import { OperationControlsDto } from '../../controls/operation-controls.dto';
import { ProjectionControlsDto } from '../../controls/projection-controls.dto';
import { RawMaterialControlsChampionCattleDto } from '../../controls/champion-cattle/raw-material-controls.dto';
import { MeControlsChampionCattleDto } from '../../controls/champion-cattle/me-controls.dto';
import { MiControlsChampionCattleDto } from '../../controls/champion-cattle/mi-controls.dto';
import { OperationControlsChampionCattleDto } from '../../controls/champion-cattle/operation-controls.dto';

export class CommonChampionCattleDto {
  @Expose()
  @Type(() => ProjectionControlsDto)
  projecao: ProjectionControlsDto;

  @Expose()
  @Type(() => RawMaterialControlsChampionCattleDto)
  matPrima: RawMaterialControlsChampionCattleDto;

  @Expose()
  @Type(() => OperationControlsDto)
  operacao: OperationControlsChampionCattleDto;

  @Expose()
  @Type(() => MiControlsDto)
  mi: MiControlsChampionCattleDto;

  @Expose()
  @Type(() => MeControlsDto)
  me: MeControlsChampionCattleDto;

  @Expose()
  @Type(() => MeIncomeControlsDto)
  rendimentosMe: MeIncomeControlsDto;

  @Expose()
  @Type(() => MiIncomeControlsDto)
  rendimentosMi: MiIncomeControlsDto;

  @Expose()
  @Type(() => MePricesControlsDto)
  precosMe: MePricesControlsDto;

  @Expose()
  @Type(() => MiPricesControlsDto)
  precosMi: MiPricesControlsDto;
}

export class GetTotalProjectionDaysDto {
  diasProjecao: number;
  diasPagamento: number;
  diasPagamentoFrete: number;
  diasPagamentoProdutos: number;
  vendasMiDias: number;
  vendasMeDias: number;
}
