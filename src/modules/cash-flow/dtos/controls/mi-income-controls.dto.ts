import { Expose, Type } from 'class-transformer';
import {
  MiDtIncomeControlsDto,
  MiPaIncomeControlsDto,
  MiTrIncomeControlsDto,
} from '../common/income.dto';

export class MiIncomeControlsDto {
  @Expose()
  @Type(() => MiDtIncomeControlsDto)
  dt: MiDtIncomeControlsDto;
  @Expose()
  @Type(() => MiPaIncomeControlsDto)
  pa: MiPaIncomeControlsDto;
  @Expose()
  @Type(() => MiTrIncomeControlsDto)
  tr: MiTrIncomeControlsDto;
}
