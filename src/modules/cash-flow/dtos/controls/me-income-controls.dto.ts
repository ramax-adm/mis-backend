import { Expose, Type } from 'class-transformer';
import {
  MeDtIncomeControlsDto,
  MePaIncomeControlsDto,
  MeTrIncomeControlsDto,
} from '../common/income.dto';

export class MeIncomeControlsDto {
  @Expose()
  @Type(() => MeDtIncomeControlsDto)
  dt: MeDtIncomeControlsDto;

  @Expose()
  @Type(() => MePaIncomeControlsDto)
  pa: MePaIncomeControlsDto;

  @Expose()
  @Type(() => MeTrIncomeControlsDto)
  tr: MeTrIncomeControlsDto;
}
