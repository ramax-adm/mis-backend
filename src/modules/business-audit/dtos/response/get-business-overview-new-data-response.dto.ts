import {
  FreightsAnalysis,
  ReturnOccurrencesSummary,
  BillingsSummary,
  SlaughtersSummary,
  StockAnalysis,
  StockSummary,
} from '../../types/get-overview-audit-data.type';

export class GetBusinessAuditOverviewDataResponseDto {
  summary: {
    billings: BillingsSummary;
    returnOccurrences: ReturnOccurrencesSummary;
    slaughters: SlaughtersSummary;
    stock: StockSummary;
  };
  analisys: {
    freights: FreightsAnalysis;
    stock: StockAnalysis;
  };

  constructor(data: GetBusinessAuditOverviewDataResponseDto) {
    Object.assign(this, data);
  }
}
