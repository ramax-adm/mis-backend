import { MarketEnum } from '@/modules/stock/enums/markets.enum';

export class ExportStockBalanceReportDto {
  filters: {
    companyCode?: string;
    market?: MarketEnum;
    productLineCode?: string;
  };
}
