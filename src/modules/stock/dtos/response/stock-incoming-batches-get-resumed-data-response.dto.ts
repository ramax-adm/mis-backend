export class GetStockIncomingBatchesResumedDataResponseDto {
  totals: {
    weightInKg: number;
    totalPrice: number;
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
        totalPrice: number;
        expiredWeightInKg: number;
      };
      market: string;
      productLineCode: string;
      productLineName: string;
      productCode: string;
      productName: string;
      basePriceCar: number | null;
    }
  >;
}
