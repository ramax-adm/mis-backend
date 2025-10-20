import { MarketEnum } from '@/modules/stock/enums/markets.enum';

export type InvoiceAgg = {
  companyCode?: string;
  companyName?: string;
  date?: Date;
  nfNumber?: string;
  orderNumber?: string;
  cfopCode?: string;
  cfopDescription?: string;
  clientCode?: string;
  clientName?: string;
  representativeCode?: string;
  representativeName?: string;
  paymentTerm?: string;
  market?: MarketEnum;
  currency?: string;
  salesCount: number;
  totalFatValue: number;
  totalTableValue: number;
  totalDiff: number;
  totalKg: number;
};

export type ProductAgg = {
  productCode?: string;
  productName?: string;
  salesCount: number;
  totalKg: number;
  totalFatValue: number;
  totalTableValue: number;
  totalDiff: number;
  percentValue: number;
};

export type ClientAgg = {
  clientCode?: string;
  clientName?: string;
  salesCount: number;
  totalKg: number;
  totalFatValue: number;
  totalTableValue: number;
  totalDiff: number;
  percentValue: number;
};

export type SalesRepresentativeAgg = {
  salesRepresentativeCode: string;
  salesRepresentativeName: string;
  salesCount: number;
  totalKg: number;
  totalFatValue: number;
  totalTableValue: number;
  totalDiff: number;
  percentValue: number;
};
