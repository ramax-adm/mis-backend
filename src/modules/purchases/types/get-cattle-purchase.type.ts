import { CattlePurchase } from '../entities/cattle-purchase.entity';

export type GetCattlePurchase = CattlePurchase & {
  headPrice: number;
  arrobaPrice: number;
  kgPrice: number;
};

export type GetCattlePurchaseRaw = {
  scp_id: string;
  scp_sensatta_id: string;
  scp_slaughter_date: Date;
  scp_cattle_owner_code: string;
  scp_cattle_owner_name: string;
  sc_sensatta_code: string;
  sc_name: string;
  scp_cattle_advisor_code: string;
  scp_cattle_advisor_name: string;
  scp_cattle_quantity: number;
  scp_cattle_classification: string;
  scp_weighing_type: string;
  scp_cattle_weight_in_arroba: number;
  scp_cattle_weight_in_kg: number;
  scp_balance_weight_in_kg: number;
  scp_payment_term_in_days: number;
  scp_freight_price: number;
  scp_funrural_price: number;
  scp_purchase_price: number;
  scp_purchase_liquid_price: number;
  scp_commission_price: number;
  scp_total_value: number;
  scp_created_at: Date;
  head_price: number;
  arroba_price: number;
  kg_price: number;
};

export type CattlePurchaseTotals = {
  cattleQuantity: number;
  weightInArroba: number;
  weightInKg: number;
  freightValue: number;
  purchaseValue: number;
  commissionValue: number;
  finalValue: number;
  arrobaPrice: number;
  headPrice: number;
  kgPrice: number;
  count: number;
};

export type CattlePurchaseKpis = {
  headPrice: number;
  arrobaPrice: number;
  kgPrice: number;
  priceDeviation: number;
  freightPercentOverTotal: number;
  commissionPercentOverTotal: number;
  purchasesCount: number;
};
