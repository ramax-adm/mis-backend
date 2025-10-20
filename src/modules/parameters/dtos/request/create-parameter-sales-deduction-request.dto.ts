import { MarketEnum } from '@/modules/stock/enums/markets.enum';
import { UnitTypesEnum } from '@/modules/utils/enums/unit-types.enum';

export class CreateParameterSalesDeductionRequestDto {
  companyCode: string;
  name: string;
  value: number;
  unit: UnitTypesEnum;
  market: MarketEnum;
}
