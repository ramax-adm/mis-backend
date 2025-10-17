import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InventoryGetResumeDataRequestDto {
  @ApiProperty()
  companyCode: string;

  @ApiProperty()
  inventoryId: string;

  constructor(data: InventoryGetResumeDataRequestDto) {
    Object.assign(this, data);
  }
}
