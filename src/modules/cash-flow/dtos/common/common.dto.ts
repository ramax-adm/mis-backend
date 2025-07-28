import { MeControlsDto } from '../controls/me-controls.dto';
import { MiControlsDto } from '../controls/mi-controls.dto';
import { OperationControlsDto } from '../controls/operation-controls.dto';
import { RawMaterialControlsDto } from '../controls/raw-material-controls.dto';
import { Expose, Type } from 'class-transformer';
import { MeIncomeControlsDto } from '../controls/me-income-controls.dto';
import { MiIncomeControlsDto } from '../controls/mi-income-controls.dto';
import { MePricesControlsDto } from '../controls/me-prices-controls.dto';
import { MiPricesControlsDto } from '../controls/mi-prices-controls.dto';
import { ProjectionControlsDto } from '../controls/projection-controls.dto';

export class CommonDto {
  @Expose()
  @Type(() => ProjectionControlsDto)
  projecao: ProjectionControlsDto;

  @Expose()
  @Type(() => RawMaterialControlsDto)
  matPrima: RawMaterialControlsDto;

  @Expose()
  @Type(() => OperationControlsDto)
  operacao: OperationControlsDto;

  @Expose()
  @Type(() => MiControlsDto)
  mi: MiControlsDto;

  @Expose()
  @Type(() => MeControlsDto)
  me: MeControlsDto;

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
