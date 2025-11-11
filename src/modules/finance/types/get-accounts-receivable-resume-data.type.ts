export interface AccountReceivableResumeTotals {
  quantity: number;
  value: number;
  openValue: number;
}

export type AccountReceivableResumeAgg = {
  quantity: number;
  value: number;
  openValue: number;
  percent: number;
  totalPercent: number;
};

export type AccountReceivableOpenValueByClientAgg = {
  quantity: number;
  value: number;
  openValueToExpire: number;
  openValueExpired: number;
  percentage: number;
};

export type AccountReceivableLossByClientAgg = {
  quantity: number;
  value: number;
  percentage: number;
};
