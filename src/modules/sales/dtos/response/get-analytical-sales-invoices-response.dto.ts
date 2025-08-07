import { GetInvoicesItem } from '../../types/get-invoices.type';

export class GetAnalyticalSalesInvoicesReportDto {
  totals: {
    quantity: number;
    productQuantity: number;
    boxAmount: number;
    weightInKg: number;
    unitPrice: number;
    totalPrice: number;
  };
  data: GetInvoicesItem[];
}
