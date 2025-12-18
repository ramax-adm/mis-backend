// -------- SUMMARY --------
export interface BillingsSummary {
  totals: { value: number; weightInKg: number };
  byMonth: ByMonthAgg;
}

export interface ReturnOccurrencesSummary {
  totals: { value: number; weightInKg: number };
  byMonth: ByMonthAgg;
  byReturnType: Record<string, { value: number; weightInKg: number }>;
}

export interface SlaughtersSummary {
  totals: { quantity: number; weightInKg: number };
  byMonth: ByMonthAgg;
}

export interface StockProductionSummary {
  totals: { quantity: number; weightInKg: number };
  byMonth: ByMonthAgg;
}

// -------- ANALISYS --------
export interface FreightsAnalysis {
  byStatus: StatusAgg;
  byFreightCompany: FreightCompanyAgg;
}

export interface StockAnalysis {
  byCompany: StockCompanyAgg;
}

// -------- AGG --------
export type ByMonthAgg = Record<
  string,
  { value?: number; quantity?: number; weightInKg: number }
>;

export type StatusAgg = Record<
  string,
  {
    quantity:number
    minOpenDays: number;
    maxOpenDays: number;
    averageOpenDays: number;
  }
>;

export type FreightCompanyAgg = Record<
  string,
  {
    value: number;
    quantity: number;
    weightInKg: number;
  }
>;

export type StockCompanyAgg = Record<
  string,
  {
    value: number;
    weightInKg: number;
    products: number;
    toExpireProducts: number;
  }
>;
