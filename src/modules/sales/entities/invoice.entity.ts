import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'sensatta_invoices' })
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', nullable: true })
  date?: Date;

  @Column({ name: 'nf_type', nullable: true })
  nfType?: string;

  @Column({ name: 'client_type_code', nullable: true })
  clientTypeCode?: string;

  @Column({ name: 'client_type_name', nullable: true })
  clientTypeName?: string;

  @Column({ name: 'company_code', nullable: true })
  companyCode?: string;

  @Column({ name: 'cfop_code', nullable: true })
  cfopCode?: string;

  @Column({ name: 'cfop_description', nullable: true })
  cfopDescription?: string;

  @Column({ name: 'nf_number', nullable: true })
  nfNumber?: string;

  @Column({ name: 'request_id', nullable: true })
  requestId?: string; // sequencial pedido

  @Column({ name: 'client_code', nullable: true })
  clientCode?: string;

  @Column({ name: 'client_name', nullable: true })
  clientName?: string;

  @Column({ name: 'product_code', nullable: true })
  productCode?: string;

  @Column({ name: 'product_name', nullable: true })
  productName?: string;

  @Column({ name: 'box_amount', type: 'int4', nullable: true })
  boxAmount?: number;

  @Column({ name: 'weight_in_kg', type: 'float4', nullable: true })
  weightInKg?: number;

  @Column({ name: 'unit_price', type: 'float4', nullable: true })
  unitPrice?: number;

  @Column({ name: 'total_price', type: 'float4', nullable: true })
  totalPrice?: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
