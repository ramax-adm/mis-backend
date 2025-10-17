import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InventoryGetAnalyticalDataRequestDto {
  @ApiPropertyOptional()
  boxNumber: string;

  @ApiProperty()
  companyCode: string;

  @ApiProperty()
  inventoryId: string;

  constructor(data: InventoryGetAnalyticalDataRequestDto) {
    Object.assign(this, data);
  }
}
