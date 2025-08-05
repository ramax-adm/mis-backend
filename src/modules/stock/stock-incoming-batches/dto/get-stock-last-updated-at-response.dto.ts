import { DateUtils } from '@/modules/utils/services/date.utils';
import { NumberUtils } from '@/modules/utils/services/number.utils';

export class GetStockLastUpdatedAtResponseDto {
  updatedAt: Date;
  externalUpdatedAt: Date;

  constructor(data: GetStockLastUpdatedAtResponseDto) {
    Object.assign(this, data);
  }

  static create(data: GetStockLastUpdatedAtResponseDto) {
    return new GetStockLastUpdatedAtResponseDto(data);
  }

  toJSON() {
    return {
      parsedUpdatedAt: DateUtils.format(this.updatedAt, 'datetime'),
      parsedExternalUpdatedAt: DateUtils.format(
        this.externalUpdatedAt,
        'datetime',
      ),
      updatedAt: this.updatedAt,
      externalUpdatedAt: this.externalUpdatedAt,
    };
  }
}
