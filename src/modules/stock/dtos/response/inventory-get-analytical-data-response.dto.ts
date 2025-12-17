import { ApiProperty } from '@nestjs/swagger';

export class InventoryAnalyticalDataDto {
  @ApiProperty()
  inventoryId: string;

  @ApiProperty()
  warehouseCode: string;

  @ApiProperty()
  productCode: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  boxNumber: string;

  @ApiProperty()
  sifCode: string;

  @ApiProperty()
  productionDate: Date;

  @ApiProperty()
  dueDate: Date;

  @ApiProperty()
  weightInKg: number;

  @ApiProperty({
    type: Object,
    example: {
      event_1: 'string',
      event_2: 'string',
    },
  })
  events: Record<string, string>;
}

export class InventoryAnalyticalTotalsDto {
  @ApiProperty()
  count: number;

  @ApiProperty()
  totalWeight: number;
}

export class InventoryGetAnalyticalDataResponseDto {
  @ApiProperty({
    type: Array<InventoryAnalyticalDataDto>,
  })
  data: InventoryAnalyticalDataDto[];

  @ApiProperty({
    type: InventoryAnalyticalTotalsDto,
  })
  totals: InventoryAnalyticalTotalsDto;

  constructor(data: {
    data: InventoryAnalyticalDataDto[];
    totals: InventoryAnalyticalTotalsDto;
  }) {
    Object.assign(this, data);
  }
}
