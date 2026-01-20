export type OccurrenceAgg = {
  occurrenceNumber: string;
  date: Date;
  invoiceDate: Date;
  occurrenceCause: string;
  returnType: string;
  companyCode: string;
  companyName: string;
  invoiceNfNumber: string;
  returnNfNumber: string;
  clientCode: string;
  clientName: string;
  salesRepresentativeCode: string;
  salesRepresentativeName: string;
  returnQuantity: number;
  invoiceQuantity: number;
  returnWeightInKg: number;
  invoiceWeightInKg: number;
  returnValue: number;
  invoiceValue: number;
};

export type OccurrenceByCompanyAgg = {
  count: number;
  quantity: number;
  weightInKg: number;
  value: number;
};

export type OccurrenceByCauseAgg = {
  count: number;
  quantity: number;
  weightInKg: number;
  value: number;
};

export type OccurrenceByRepresentativeAgg = {
  count: number;
  quantity: number;
  weightInKg: number;
  value: number;
};

export type OccurrenceByClientAgg = {
  count: number;
  quantity: number;
  weightInKg: number;
  value: number;
};

export type OccurrenceByProductAgg = {
  count: number;
  quantity: number;
  weightInKg: number;
  value: number;
};

export type OccurrenceByDayAgg = {
  count: number;
  quantity: number;
  weightInKg: number;
  value: number;
};

export type OccurrenceByTypeAgg = {
  count: number;
  quantity: number;
  weightInKg: number;
  value: number;
};
