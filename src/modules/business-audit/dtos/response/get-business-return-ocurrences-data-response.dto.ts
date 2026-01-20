import { ReturnOccurrence } from '@/modules/sales/entities/return-occurrence.entity';
import { OccurrenceAgg } from '../../types/get-return-occurrences-data.type';

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
  occurrences: {
    data: Record<string, OccurrenceAgg>;
    totals: BusinessAuditReturnOccurrencesDataTotals;
  };

  constructor(data: GetBusinessAuditReturnOccurrencesDataResponseDto) {
    Object.assign(this, data);
  }
}
