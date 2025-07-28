import { GetFreightsItem } from '../../types/get-freights.type';

type GetBusinessAuditResumeDataAggregated = Record<
  string,
  {
    quantity: number;
    weightInKg: number;
    totalPrice: number;
  }
>;
export class GetBusinessAuditResumeDataResponseDto {
  manuallyEnteredInvoicesByCompany: GetBusinessAuditResumeDataAggregated;
  manuallyEnteredInvoicesByClient: GetBusinessAuditResumeDataAggregated;
  manuallyEnteredInvoicesTotals: {
    quantity: number;
    weightInKg: number;
    totalPrice: number;
  };
  openCattlePurchaseFreightsTotals: {
    quantity: number;
  };
  openCattlePurchaseFreights: GetFreightsItem[];
  cattlePurchaseFreightsDuplicated: {
    date: Date;
    companyCode: string;
    purchaseCattleOrderId: string;
    freightTransportPlate: string;
    cattleQuantity: number;
  }[];

  cattlePurchaseFreightsOverTablePrice: {
    date: Date;
    companyCode: string;
    purchaseCattleOrderId: string;
    referenceFreightTablePrice: number;
    negotiatedFreightPrice: number;
  }[];

  cattlePurchaseFreightsDuplicatedTotals: {
    quantity: number;
  };

  cattlePurchaseFreightsOverTablePriceTotals: {
    quantity: number;
    referenceFreightTablePrice: number;
    negotiatedFreightPrice: number;
  };

  toExpiresStock: Record<
    string,
    {
      dueDate: Date;
      companyCode: string;
      productCode: string;
      productName: string;
      totalWeightInKg: number;
      daysToExpires: number;
    }
  >;
  toExpiresStockTotals: {
    totalWeightInKg: number;
    daysToExpires: number;
  };

  constructor(data: GetBusinessAuditResumeDataResponseDto) {
    Object.assign(this, data);
  }
}
