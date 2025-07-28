import { MarketEnum } from '@/core/enums/sensatta/markets.enum';
import { UnitTypesEnum } from '@/modules/utils/enums/unit-types.enum';

export class CreateParameterSalesDeductionRequestDto {
  companyCode: string;
  name: string;
  value: number;
  unit: UnitTypesEnum;
  market: MarketEnum;
}
