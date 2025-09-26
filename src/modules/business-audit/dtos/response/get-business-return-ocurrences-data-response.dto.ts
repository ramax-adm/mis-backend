import { ReturnOccurrence } from '@/modules/sales/entities/return-occurrence.entity';

export type BusinessAuditReturnOccurrencesDataTotals = {
  count: number;
  quantity: number;
  weightInKg: number;
  value: number;
};

export class GetBusinessAuditReturnOccurrencesDataResponseDto {
  occurrencesByCompany?: {
    totals: BusinessAuditReturnOccurrencesDataTotals;
    data: Record<string, any>;
  };
  occurrencesByCause?: {
    totals: BusinessAuditReturnOccurrencesDataTotals;
    data: Record<string, any>;
  };
  occurrencesByRepresentative?: {
    totals: BusinessAuditReturnOccurrencesDataTotals;
    data: Record<string, any>;
  };
  occurrencesByClient?: {
    totals: BusinessAuditReturnOccurrencesDataTotals;
    data: Record<string, any>;
  };
  occurrencesByProduct?: {
    totals: BusinessAuditReturnOccurrencesDataTotals;
    data: Record<string, any>;
  };
  occurrencesByDay?: {
    totals: BusinessAuditReturnOccurrencesDataTotals;
    data: Record<string, any>;
  };
  occurrencesByType?: Record<string, any>;
  returnOccurrences: ReturnOccurrence[];

  constructor(data: GetBusinessAuditReturnOccurrencesDataResponseDto) {
    Object.assign(this, data);
  }
}
