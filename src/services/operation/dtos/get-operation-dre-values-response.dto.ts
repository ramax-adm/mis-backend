export class GetOperationDREValuesResponse {
  incomes: {
    label: string;
    value: number;
  }[];
  incomesTotal: number;

  costs: {
    label: string;
    value: number;
  }[];

  costsTotal: number;

  expenses: {
    label: string;
    value: number;
  }[];

  expensesTotal: number;

  relationIncomesCostsExpenses: {
    item: { label: string; value: number }[];
    itemLabel: string;
    itemTotal: number;
  }[];
  relationIncomesCostsExpensesTotal: number;
  relationStockPendingSales: number;

  total: number;
}
