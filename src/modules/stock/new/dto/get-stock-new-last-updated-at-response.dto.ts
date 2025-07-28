import { DateUtils } from '@/modules/utils/services/date.utils';

export class GetStockNewLastUpdatedAtResponseDto {
  updatedAt: Date;

  constructor(data: GetStockNewLastUpdatedAtResponseDto) {
    Object.assign(this, data);
  }

  static create(data: GetStockNewLastUpdatedAtResponseDto) {
    return new GetStockNewLastUpdatedAtResponseDto(data);
  }

  toJSON() {
    return {
      parsedUpdatedAt: DateUtils.format(this.updatedAt, 'datetime'),
      updatedAt: this.updatedAt,
    };
  }
}
