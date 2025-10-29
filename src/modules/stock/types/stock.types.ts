import { Company } from '@/core/entities/sensatta/company.entity';
import { ReferencePrice } from '@/modules/stock/entities/reference-price.entity';

export type StockOptionalData = {
  company?: Company;
  incomingBatchesWithRelations?: GetIncomingBatchesQueryResponse[];
  externalIncomingBatchesWithRelations?: GetExternalIncomingBatchesQueryResponse[];
  refPrices?: Array<ReferencePrice>;
};

export type GetIncomingBatchesQueryResponse = {
  companyCode: string;
  companyName: string;
  productLineAcronym: string;
  productLineCode: string;
  productLineName: string;
  productId: string;
  productCode: string;
  productName: string;
  productClassification: string;
  productionDate: string;
  dueDate: string;
  boxAmount: number;
  quantity: number;
  weightInKg: number;
};

export type GetExternalIncomingBatchesQueryResponse = {
  companyCode: string;
  companyName: string;
  productLineAcronym: string | null;
  productLineCode: string | null;
  productLineName: string | null;
  productId: string | null;
  productCode: string | null;
  productName: string | null;
  productClassification: string | null;
  productionDate: string; // ou Date, dependendo do que o driver retorna
  dueDate: string; // ou Date
  boxAmount: number;
  quantity: number;
  weightInKg: number;
};

export type ResumedStockByCompanyAgg = {
  companyName: string;
  productLineAcronym: string;
  productLineName: string;
  productName: string;
  productClassification: string;
  basePriceCar: number;
  basePriceTruck: number;
  boxAmount?: number;
  quantity?: number;
  totalWeightInKg?: number;
  totalPrice?: number;
};

export type ResumedStockToExpiresByCompanyAgg = {
  productionDate: string;
  dueDate: string;
  productCode: string;
  companyName: string;
  productLineAcronym: string;
  productLineName: string;
  productName: string;
  productClassification: string;
  daysFromProduction: number;
  daysToExpires: number;
  boxAmount?: number;
  quantity?: number;
  totalWeightInKg?: number;
};

export type AnalyticalStockToExpiresByCompanyAgg = {
  productionDate: string;
  dueDate: string;
  companyName: string;
  productLineAcronym: string;
  productLineCode: string;
  productLineName: string;
  productCode: string;
  productName: string;
  productClassification: string;
  basePriceCar: number;
  basePriceTruck: number;
  daysFromProduction: number;
  daysToExpires: number;
  boxAmount?: number;
  quantity?: number;
  totalWeightInKg?: number;
  totalPrice?: number;
};

export type AllStockDataAgg = {
  productionDate: string;
  dueDate: string;
  companyCode: string;
  companyName: string;
  productLineAcronym: string;
  productLineCode: string;
  productLineName: string;
  productCode: string;
  productName: string;
  productClassification: string;
  daysFromProduction: number;
  daysToExpires: number;
  basePriceCar: number;
  basePriceTruck: number;
  boxAmount: number;
  quantity: number;
  totalWeightInKg: number;
  totalPrice: number;
};
