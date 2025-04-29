import { DateUtils } from '@/services/utils/date.utils';
import { NumberUtils } from '@/services/utils/number.utils';

export class GetStockLastUpdatedAtResponseDto {
  updatedAt: Date;

  constructor(data: GetStockLastUpdatedAtResponseDto) {
    Object.assign(this, data);
  }

  static create(data: GetStockLastUpdatedAtResponseDto) {
    return new GetStockLastUpdatedAtResponseDto(data);
  }

  toJSON() {
    return {
      parsedUpdatedAt: DateUtils.format(this.updatedAt, 'datetime'),
      updatedAt: this.updatedAt,
    };
  }
}
