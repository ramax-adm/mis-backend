import { DateUtils } from '@/modules/utils/services/date.utils';

export class GetHumanResourcesHoursLastUpdatedAtResponseDto {
  updatedAt: Date;

  constructor(data: GetHumanResourcesHoursLastUpdatedAtResponseDto) {
    Object.assign(this, data);
  }

  static create(data: GetHumanResourcesHoursLastUpdatedAtResponseDto) {
    return new GetHumanResourcesHoursLastUpdatedAtResponseDto(data);
  }

  toJSON() {
    return {
      parsedUpdatedAt: DateUtils.format(this.updatedAt, 'datetime'),
      updatedAt: this.updatedAt,
    };
  }
}
