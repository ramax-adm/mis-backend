import { MarketEnum } from '@/core/enums/sensatta/markets.enum';

export class ExportStockBalanceReportDto {
  filters: {
    companyCode?: string;
    market?: MarketEnum;
    productLineCode?: string;
  };
}
