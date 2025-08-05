import { Company } from '@/core/entities/sensatta/company.entity';
import { ReferencePrice } from '@/core/entities/sensatta/reference-price.entity';

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
