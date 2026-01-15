import { MarketEnum } from '@/modules/stock/enums/markets.enum';
import { OrderLine } from '../../entities/order-line.entity';

export class OrdersGetAnalyticalDataResponseDto {
  totals: {
    count: number;
    quantity: number;
    weightInKg: number;
    totalValue: number;
    tableValue: number;
    difValue: number;
  };
  data: Record<
    string,
    {
      billingDate: Date;
      issueDate: Date;
      companyCode: string;
      companyName: string;
      orderId: string;
      market: MarketEnum;
      situation: string;
      clientCode: string;
      clientName: string;
      salesRepresentativeCode: string;
      salesRepresentativeName: string;
      nfId: string;
      nfNumber: string;
      weightInKg: number;
      saleUnitValue: number;
      referenceTableUnitValue: number;
      totalValue: number;
      tableValue: number;
      difValue: number;
    }
  >;

  constructor(data: OrdersGetAnalyticalDataResponseDto) {
    Object.assign(this, data);
  }
}
