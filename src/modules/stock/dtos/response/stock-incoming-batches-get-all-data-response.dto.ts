export class GetStockIncomingBatchesAllDataResponseDto {
  data: Record<
    string,
    {
      market: string;
      productLineCode: string;
      productLineName: string;
      productCode: string;
      productName: string;
      basePriceCar: number | null;
      totals: {
        weightInKg: number;
        totalPrice: number;
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
