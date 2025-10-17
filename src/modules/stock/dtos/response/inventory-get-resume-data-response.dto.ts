import { ApiProperty } from '@nestjs/swagger';

export class InventoryResumeDataDto {
  @ApiProperty()
  inventoryId: string;

  @ApiProperty()
  warehouseCode: string;

  @ApiProperty()
  productCode: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  inventoryQuantity: number;

  @ApiProperty()
  inventoryWeightInKg: number;

  @ApiProperty()
  stockQuantity: number;

  @ApiProperty()
  stockWeightInKg: number;

  @ApiProperty()
  blockedQuantity: number;

  @ApiProperty()
  blockedWeightInKg: number;

  @ApiProperty()
  cancelatedQuantity: number;

  @ApiProperty()
  cancelatedWeightInKg: number;

  @ApiProperty()
  dispatchedQuantity: number;

  @ApiProperty()
  dispatchedWeightInKg: number;

  @ApiProperty()
  quantityDif: number;

  @ApiProperty()
  weightInKgDif: number;
}

export class InventoryResumeTotalsDto {
  @ApiProperty()
  count: number;

  @ApiProperty()
  stockQuantity: number;

  @ApiProperty()
  stockWeightInKg: number;

  @ApiProperty()
  blockedQuantity: number;

  @ApiProperty()
  blockedWeightInKg: number;

  @ApiProperty()
  cancelatedQuantity: number;

  @ApiProperty()
  cancelatedWeightInKg: number;

  @ApiProperty()
  dispatchedQuantity: number;

  @ApiProperty()
  dispatchedWeightInKg: number;

  @ApiProperty()
  quantityDif: number;

  @ApiProperty()
  weightInKgDif: number;
}

export class InventoryGetResumeDataResponseDto {
  @ApiProperty({
    type: Array<InventoryResumeDataDto>,
  })
  data: InventoryResumeDataDto[];

  @ApiProperty({
    type: InventoryResumeTotalsDto,
  })
  totals: InventoryResumeTotalsDto;

  constructor(data: {
    data: InventoryResumeDataDto[];
    totals: InventoryResumeTotalsDto;
  }) {
    Object.assign(this, data);
  }
}
