export type GetStockBalanceRawItem = {
  company_code: string;
  company_name: string;
  product_line_code: string;
  product_line_name: string;
  market: string;
  product_code: string;
  product_name: string;
  weight_in_kg: number;
  quantity: number;
  reserved_weight_in_kg: number;
  reserved_quantity: number;
  available_weight_in_kg: number;
  available_quantity: number;
  created_at: Date;
};

export type GetStockBalanceItem = {
  companyCode: string;
  companyName: string;
  productLineCode: string;
  productLineName: string;
  productLine: string;
  market: string;
  productCode: string;
  productName: string;
  product: string;
  weightInKg: number;
  quantity: number;
  reservedWeightInKg: number;
  reservedQuantity: number;
  availableWeightInKg: number;
  availableQuantity: number;
  createdAt: Date;
};
