export class GetStockIncomingBatchesAnalyticalDataResponseDto {
  data: Record<
    string,
    {
      totals: {
        weightInKg: number;
        expiredWeightInKg: number;
        byExpireRange: Record<string, number>;
      };
      market: string;
      companyCode: string;
      companyName: string;
      productLineCode: string;
      productLineName: string;
      productCode: string;
      productName: string;
    }
  >;
  totals: {
    weightInKg: number;
    expiredWeightInKg: number;
    byExpireRange: Record<string, number>;
  };
}
