import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'sensatta_order_lines' })
export class OrderLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'billing_date', type: 'date', nullable: true })
  billingDate?: Date;

  @Column({ name: 'issue_date', type: 'date', nullable: true })
  issueDate?: Date;

  @Column({ name: 'company_code', nullable: true })
  companyCode?: string;

  @Column({ name: 'company_name', nullable: true })
  companyName?: string;

  @Column({ name: 'order_id', nullable: true })
  orderId?: string;

  @Column({ nullable: true })
  situation?: string;

  @Column({ name: 'payment_term', nullable: true })
  paymentTerm?: string;

  @Column({ name: 'client_code', nullable: true })
  clientCode?: string;

  @Column({ name: 'client_name', nullable: true })
  clientName?: string;

  @Column({ name: 'sales_representative_code', nullable: true })
  salesRepresentativeCode?: string;

  @Column({ name: 'sales_representative_name', nullable: true })
  salesRepresentativeName?: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ name: 'product_line_code', nullable: true })
  productLineCode?: string;

  @Column({ name: 'product_line_name', nullable: true })
  productLineName?: string;

  @Column({ name: 'product_code', nullable: true })
  productCode?: string;

  @Column({ name: 'product_name', nullable: true })
  productName?: string;

  @Column({ type: 'int', nullable: true })
  quantity?: number;

  @Column({ name: 'weight_in_kg', type: 'float4', nullable: true })
  weightInKg?: number;

  @Column({ name: 'cost_value', type: 'float4', nullable: true })
  costValue?: number;

  @Column({ name: 'discount_promotion_value', type: 'float4', nullable: true })
  discountPromotionValue?: number;

  @Column({ name: 'sale_unit_value', type: 'float4', nullable: true })
  saleUnitValue?: number;

  @Column({
    name: 'reference_table_unit_value',
    type: 'float4',
    nullable: true,
  })
  referenceTableUnitValue?: number;

  @Column({ name: 'total_value', type: 'float4', nullable: true })
  totalValue?: number;

  @Column({ name: 'receivable_title_value', type: 'float4', nullable: true })
  receivableTitleValue?: number;

  @Column({ name: 'reference_table_id', nullable: true })
  referenceTableId?: string;

  @Column({ name: 'reference_table_description', nullable: true })
  referenceTableDescription?: string;

  @Column({ name: 'freight_company_id', nullable: true })
  freightCompanyId?: string;

  @Column({ name: 'freight_company_name', nullable: true })
  freightCompanyName?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'receivable_title_id', nullable: true })
  receivableTitleId?: string;

  @Column({ name: 'receivable_title_number', nullable: true })
  receivableTitleNumber?: string;

  @Column({ name: 'receivable_title_observation', nullable: true })
  receivableTitleObservation?: string;

  @Column({ name: 'account_group_code', nullable: true })
  accountGroupCode?: string;

  @Column({ name: 'account_group_name', nullable: true })
  accountGroupName?: string;

  @Column({ name: 'account_code', nullable: true })
  accountCode?: string;

  @Column({ name: 'account_name', nullable: true })
  accountName?: string;

  @Column({ name: 'nf_id', nullable: true })
  nfId?: string;

  @Column({ name: 'nf_number', nullable: true })
  nfNumber?: string;

  @Column({ name: 'cfop_code', nullable: true })
  cfopCode?: string;

  @Column({ name: 'cfop_description', nullable: true })
  cfopDescription?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
