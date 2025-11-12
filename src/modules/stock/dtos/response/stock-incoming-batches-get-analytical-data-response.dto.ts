export class GetStockIncomingBatchesAnalyticalDataResponseDto {
  data: Record<
    string,
    {
      totals: {
        weightInKg: number;
        totalPrice: number;
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
      basePriceCar: number;
    }
  >;
  totals: {
    weightInKg: number;
    totalPrice: number;
    expiredWeightInKg: number;
    byExpireRange: Record<string, number>;
  };
}
