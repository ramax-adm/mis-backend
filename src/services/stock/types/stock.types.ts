import { Company } from '@/common/entities/sensatta/company.entity';
import { ReferencePrice } from '@/common/entities/sensatta/reference-price.entity';

export type StockOptionalData = {
  company?: Company;
  incomingBatchesWithRelations?: GetIncomingBatchesQueryResponse[];
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
