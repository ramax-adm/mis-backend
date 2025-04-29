import { NumberUtils } from '@/services/utils/number.utils';
import { IsNumber } from 'class-validator';

export class ProjectEntriesResponseDto {
  @IsNumber()
  totalIncomeEntriesMe: number;
  @IsNumber()
  totalIncomeEntriesMi: number;
  @IsNumber()
  totalIncome: number;

  static getData(raw: ProjectEntriesResponseDto) {
    return {
      totalIncomeEntriesMe: NumberUtils.toLocaleString(
        raw.totalIncomeEntriesMe,
      ),
      totalIncomeEntriesMi: NumberUtils.toLocaleString(
        raw.totalIncomeEntriesMi,
      ),
      totalIncome: NumberUtils.toLocaleString(raw.totalIncome),
    };
  }
}
