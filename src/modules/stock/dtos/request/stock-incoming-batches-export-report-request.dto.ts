import { MarketEnum } from '@/modules/stock/enums/markets.enum';
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
