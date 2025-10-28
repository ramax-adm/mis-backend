export class GetStockIncomingBatchesAllDataResponseDto {
  data: Record<
    string,
    {
      market: string;
      productLineCode: string;
      productLineName: string;
      productCode: string;
      productName: string;
      totals: {
        weightInKg: number;
        expiredWeightInKg: number;
        byExpireRange: Map<string, number>;
        byCompany: Map<
          string,
          {
            weightInKg: number;
            expiredWeightInKg: number;
            byExpireRange: Map<string, number>;
          }
        >;
      };
    }
  >;
}
