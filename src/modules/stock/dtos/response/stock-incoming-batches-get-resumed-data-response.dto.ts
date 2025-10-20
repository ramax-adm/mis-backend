export class GetStockIncomingBatchesResumedDataResponseDto {
  totals: {
    weightInKg: number;
    expiredWeightInKg: number;
    byExpireRange: Record<string, number>;
    byCompany: Record<string, number>;
  };
  data: Record<
    string,
    {
      totals: {
        byExpireRange: Record<string, number>;
        byCompany: Record<string, number>;
        weightInKg: number;
        expiredWeightInKg: number;
      };
      market: string;
      productLineCode: string;
      productLineName: string;
      productCode: string;
      productName: string;
    }
  >;
}
