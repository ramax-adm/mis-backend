import { ApiProperty } from '@nestjs/swagger';

export type FilterOptionsType = {
  label: string;
  value: string;
  key: string;
};

export class FilterOption {
  @ApiProperty()
  label: string;

  @ApiProperty()
  key: string;

  @ApiProperty()
  value: string;

  constructor({ label, key, value }: FilterOptionsType) {
    Object.assign(this, { label, key, value });
  }
}
