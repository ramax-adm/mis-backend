import { GetCattlePurchaseFreightsItem } from '../../types/get-freights.type';
import {
  ClientAgg,
  InvoiceAgg,
  ProductAgg,
  SalesRepresentativeAgg,
} from '../../types/get-sales-audit-data.type';

type GetBusinessAuditSalesDataTotals = {
  count: number;
  totalFatValue: number;
  totalTableValue: number;
  totalDiff: number;
};

export class GetBusinessAuditSalesDataResponseDto {
  salesByInvoice: {
    totals: GetBusinessAuditSalesDataTotals;
    data: Record<string, InvoiceAgg>; // Map<string, InvoiceAgg>
  };
  salesByProduct: {
    totals: GetBusinessAuditSalesDataTotals;
    data: Record<string, ProductAgg>; // Map<string, ProductAgg>
  };
  salesByClient: {
    totals: GetBusinessAuditSalesDataTotals;
    data: Record<string, ClientAgg>; // Map<string, ClientAgg>
  };
  salesByRepresentative: {
    totals: GetBusinessAuditSalesDataTotals;
    data: Record<string, SalesRepresentativeAgg>; // Map<string, SalesRepresentativeAgg>
  };

  constructor(data: GetBusinessAuditSalesDataResponseDto) {
    Object.assign(this, data);
  }
}
