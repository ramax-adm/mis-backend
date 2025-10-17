import { ApiProperty } from '@nestjs/swagger';

export class InventoryGetLastUpdatedAtResponseDto {
  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  parsedUpdatedAt: string;

  constructor(data: InventoryGetLastUpdatedAtResponseDto) {
    Object.assign(this, data);
  }
}
