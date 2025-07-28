import { DateUtils } from '@/modules/utils/services/date.utils';

export class GetCattlePurchaseLastUpdatedAtResponseDto {
  updatedAt: Date;

  constructor(data: GetCattlePurchaseLastUpdatedAtResponseDto) {
    Object.assign(this, data);
  }

  static create(data: GetCattlePurchaseLastUpdatedAtResponseDto) {
    return new GetCattlePurchaseLastUpdatedAtResponseDto(data);
  }

  toJSON() {
    return {
      parsedUpdatedAt: DateUtils.format(this.updatedAt, 'datetime'),
      updatedAt: this.updatedAt,
    };
  }
}
