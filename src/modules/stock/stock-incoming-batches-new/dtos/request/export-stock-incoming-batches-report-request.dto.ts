import { MarketEnum } from '@/core/enums/sensatta/markets.enum';
import { IsString } from 'class-validator';

export class ExportStockIncomingBatchesReportRequestDto {
  @IsString()
  exportType: 'resumed' | 'analytical';

  filters: {
    companyCode?: string;
    market?: MarketEnum;
    productLineCodes?: string[];
  };
}
