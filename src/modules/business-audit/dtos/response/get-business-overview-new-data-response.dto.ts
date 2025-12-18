import {
  FreightsAnalysis,
  ReturnOccurrencesSummary,
  BillingsSummary,
  SlaughtersSummary,
  StockAnalysis,
  StockProductionSummary,
} from '../../types/get-overview-audit-data.type';

export class GetBusinessAuditOverviewDataResponseDto {
  summary: {
    billings: BillingsSummary;
    returnOccurrences: ReturnOccurrencesSummary;
    slaughters: SlaughtersSummary;
    stockProduction: StockProductionSummary;
  };
  analisys: {
    freights: FreightsAnalysis;
    stock: StockAnalysis;
  };

  constructor(data: GetBusinessAuditOverviewDataResponseDto) {
    Object.assign(this, data);
  }
}
