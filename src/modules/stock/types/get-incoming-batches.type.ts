export type GetIncomingBatchesItemRaw = {
  company_code: string;
  company_name: string;
  product_code: string;
  product_name: string;
  product_line_code: string;
  product_line_name: string;
  market: string;
  production_date: Date;
  slaughter_date: Date;
  due_date: Date;
  box_amount: number;
  quantity: number;
  weight_in_kg: number;
};

export type GetIncomingBatchesItem = {
  companyCode: string;
  companyName: string;
  productCode: string;
  productName: string;
  productLineCode: string;
  productLineName: string;
  market: string;
  productionDate: Date;
  slaughterDate: Date;
  dueDate: Date;
  boxAmount: number;
  quantity: number;
  weightInKg: number;
};
