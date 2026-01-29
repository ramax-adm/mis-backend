//   id: 'da725ecb-bac9-4a5d-8059-10894743f256',
//   date: 2025-08-27T03:00:00.000Z,
//   company_code: '15',
//   PEDIDO_FATURAMENTO: '34069',
//   NF_FATURAMENTO: '26',
//   BO: '2151',
//   NF_DEVOLUCAO: null,
//   SEQUENCIA_REFATURAMENTO: '1',
//   PEDIDO_REFATURAMENTO: '37623',
//   NF_REFATURAMENTO: '386',
//   created_at: 2025-12-10T04:00:44.455Z,
//   CODIGO_EMPRESA: '15',
//   ID_NF_FATURAMENTO: '35607',
//   ID_NF_REFATURAMENTO: '38787',
//   occurrence_number: '2151',
//   occurrence_cause: 'ERRO DE DIGITACAO',
//   return_type: 'Integral',
//   nf_type: 'AVULSA',
//   client_type_code: null,
//   client_type_name: null,
//   cfop_code: '5101',
//   cfop_description: 'VENDA DE PRODUCAO DO ESTABELECIMENTO',
//   nf_number: '386',
//   order_id: '37623',
//   client_code: '11068',
//   client_name: 'FUGA S/A',
//   product_code: '32624',
//   product_name: 'COURO',
//   quantity: 1,
//   weight_in_kg: 6590,
//   unit_price: 0.5,
//   total_price: 3295,
//   nf_situation: 'Autorizada',
//   nf_id: '38787',
//   nf_document_type: 'NFe',
//   order_category: 'REFATURAMENTO (GO)',
//   order_operation: 'Venda'

export interface GetReinvoicingHistoryItemRaw {
  // -------- TempHistoricoRefaturamento (thr)
  CODIGO_EMPRESA: string;
  BO: string;
  ID_NF_FATURAMENTO: string;
  ID_NF_REFATURAMENTO: string;
  NF_REFATURAMENTO: string;
  SEQUENCIA_REFATURAMENTO: number;

  company_name: string;
  // -------- Sensatta Invoices (si)
  date: Date;
  nf_number: string;
  category: string;
  client_code: string;
  client_name: string;
  sales_representative_code: string;
  sales_representative_name: string;
  product_code: string;
  product_name: string;
  weight_in_kg: number;
  sale_unit_price: number;
  table_unit_price?: number;
  invoicing_value: number;
  table_value?: number;

  // -------- Sensatta Invoices Refaturamento (si2)
  date_reinvoicing: Date;
  nf_number_reinvoicing: string;
  nf_situation_reinvoicing: string;
  category_reinvoicing: string;
  product_code_reinvoicing: string;
  product_name_reinvoicing: string;
  client_code_reinvoicing: string;
  client_name_reinvoicing: string;
  weight_in_kg_reinvoicing: number;
  unit_price_reinvoicing: number;
  table_unit_price_reinvoicing: number;
  invoicing_value_reinvoicing: number;
  table_value_reinvoicing?: number;

  // -------- Ocorrências (subquery T)
  occurrence_number: string | null;
  occurrence_cause: string | null;
  return_nf: string | null;
  return_type: string | null;
  observation: string | null;
  return_product_code: string | null;
  return_product_name: string | null;
  return_weight_in_kg: number | null;
  return_value: number | null;

  agg_date_reinvoicing: Date;
  agg_product_reinvoicing: string;
  agg_weight_in_kg_reinvoicing: number;
}

// ======================================================
// TIPO FINAL NORMALIZADO (RETORNO DO SERVICE)
// ======================================================
export interface GetReinvoicingHistoryItem {
  companyCode: string;
  companyName: string;
  date: Date;
  nfNumber: string;
  category: string;
  clientCode: string;
  clientName: string;
  salesRepresentativeCode: string;
  salesRepresentativeName: string;
  productCode: string;
  productName: string;
  weightInKg: number;
  saleUnitPrice: number;
  tableUnitPrice: number;
  invoicingValue: number;
  tableValue: number;
  reInvoicingDate: Date;
  reInvoicingNfNumber: string;
  reInvoicingNfSituation: string;
  reInvoicingCategory: string;
  reInvoicingProductCode: string;
  reInvoicingProductName: string;
  reInvoicingClientCode: string;
  reInvoicingClientName: string;
  reInvoicingWeightInKg: number;
  reInvoicingUnitPrice: number;
  reInvoicingTableUnitPrice: number;
  reInvoicingValue: number;
  reInvoicingTableValue: number;
  reInvoicingDif: number;
  difDays: number;
  difWeightInKg: number;
  difWeightInKgProportional: number;
  difSaleUnitPrice: number;
  difValue: number;
  difValuePercent: number;

  occurrenceNumber: string;
  occurrenceCause: string;
  occurrenceNf: string;
  occurrenceNfProductId: string;
  returnWeightInKg: number;
  returnValue: number;
  reinvoicingSequence: number;
  returnType: string;
  observation: string;

  // CAMPOS NOVOS FRANCISCO
  //  PESO C1 	 $V C1
  // weightInKgProportional:number
  invoicingValueProportional: number;
  testFinalValue: number;

  aggDateReinvoicing: Date;
  aggProductReinvoicing: string;
  aggWeightInKgReinvoicing: number;
}
