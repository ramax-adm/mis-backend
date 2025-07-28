export interface GetCattlePurchaseFreightsResponse {
  slaughter_date: Date;
  company_code: string;
  company_name: string;
  purchase_cattle_order_id: string;
  status: string;
  freight_company_name: string;
  supplier_name: string;
  cattle_advisor_name: string;
  freight_transport_plate: string;
  freight_transport_type: string;
  feedlot_name: string;
  feedlot_km_distance: number;
  negotiated_km_distance: number;
  cattle_quantity: number;
  reference_freight_table_price: number;
  negotiated_freight_price: number;
  dif_price: number;
  price_km: number;
  price_km_cattle_quantity: number;
  entry_nf: string;
  complement_nf: string;
}
