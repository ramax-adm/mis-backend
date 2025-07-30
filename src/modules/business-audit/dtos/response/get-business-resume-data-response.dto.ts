import { GetCattlePurchaseFreightsItem } from '../../types/get-freights.type';

type GetBusinessAuditResumeDataAggregated = Record<
  string,
  {
    quantity: number;
    productQuantity: number;
    weightInKg: number;
    totalPrice: number;
  }
>;
export class GetBusinessAuditResumeDataResponseDto {
  invoicesWithSamePrice: {
    date: Date;
    nfNumber: string;
    companyCode: string;
    companyName: string;
    clientCode: string;
    clientName: string;
    totalPrice: number;
  }[];
  invoicesWithSamePriceTotals: {
    quantity: number;
    totalPrice: number;
  };
  manuallyEnteredInvoicesByCompany: GetBusinessAuditResumeDataAggregated;
  manuallyEnteredInvoicesByClient: GetBusinessAuditResumeDataAggregated;
  manuallyEnteredInvoicesTotals: {
    quantity: number;
    productQuantity: number;
    weightInKg: number;
    totalPrice: number;
  };
  openCattlePurchaseFreightsTotals: {
    quantity: number;
  };
  openCattlePurchaseFreights: GetCattlePurchaseFreightsItem[];
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
