import { MarketEnum } from '@/modules/stock/enums/markets.enum';
import { OrderPriceConsiderationEnum } from '../../enums/order-price-consideretion.enum';

export class ExportBusinessAuditReportDto {
  filters: {
    startDate?: Date;
    endDate?: Date;
    companyCodes?: string;
    market?: MarketEnum;
    priceConsideration?: OrderPriceConsiderationEnum;
    clientCodes?: string;
    salesRepresentativeCodes?: string;
    occurrenceNumber?: string;
    returnType?: string;
    occurrenceCauses?: string;
  };
}
