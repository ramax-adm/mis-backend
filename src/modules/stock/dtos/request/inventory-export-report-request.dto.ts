import { MarketEnum } from '@/modules/stock/enums/markets.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class InventoryExportReportFilters {
  @ApiPropertyOptional()
  boxNumber: string;

  @ApiPropertyOptional()
  companyCode: string;

  @ApiPropertyOptional()
  inventoryId: string;
}

export class InventoryExportReportRequestDto {
  @ApiProperty({
    type: InventoryExportReportFilters,
  })
  filters: InventoryExportReportFilters;
}
