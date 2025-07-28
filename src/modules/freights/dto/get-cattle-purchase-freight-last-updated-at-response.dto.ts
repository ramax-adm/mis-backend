import { DateUtils } from '@/modules/utils/services/date.utils';

export class GetCattlePurchaseFreightLastUpdatedAtResponseDto {
  updatedAt: Date;

  constructor(data: GetCattlePurchaseFreightLastUpdatedAtResponseDto) {
    Object.assign(this, data);
  }

  static create(data: GetCattlePurchaseFreightLastUpdatedAtResponseDto) {
    return new GetCattlePurchaseFreightLastUpdatedAtResponseDto(data);
  }

  toJSON() {
    return {
      parsedUpdatedAt: DateUtils.format(this.updatedAt, 'datetime'),
      updatedAt: this.updatedAt,
    };
  }
}
