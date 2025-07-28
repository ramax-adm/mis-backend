import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'sensatta_return_invoices' })
export class ReturnInvoices {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', nullable: true })
  date?: Date;

  @Column({ name: 'invoice_date', type: 'date', nullable: true })
  invoiceDate?: Date;

  @Column({ name: 're_invoicing_date', type: 'date', nullable: true })
  reInvoicingDate?: Date;

  @Column({ name: 'company_code', nullable: true })
  companyCode?: string;

  @Column({ name: 'company_name', nullable: true })
  companyName?: string;

  @Column({ name: 'product_code', nullable: true })
  productCode?: string;

  @Column({ name: 'product_name', nullable: true })
  productName?: string;

  @Column({ name: 'client_code', nullable: true })
  clientCode?: string;

  @Column({ name: 'client_name', nullable: true })
  clientName?: string;

  @Column({ name: 'sales_representative_code', nullable: true })
  salesRepresentativeCode?: string;

  @Column({ name: 'sales_representative_name', nullable: true })
  salesRepresentativeName?: string;

  @Column({ name: 'invoice_nf', nullable: true })
  invoiceNf?: string;

  @Column({ name: 'invoice_weight_in_kg', type: 'float4', nullable: true })
  invoiceWeightInKg?: number;

  @Column({ name: 'invoice_quantity', type: 'int', nullable: true })
  invoiceQuantity?: number;

  @Column({ name: 'invoice_value', type: 'float4', nullable: true })
  invoiceValue?: number;

  @Column({ name: 'return_nf', nullable: true })
  returnNf?: string;

  @Column({ name: 'return_weight_in_kg', type: 'float4', nullable: true })
  returnWeightInKg?: number;

  @Column({ name: 'return_quantity', type: 'int', nullable: true })
  returnQuantity?: number;

  @Column({ name: 'return_value', type: 'float4', nullable: true })
  returnValue?: number;

  @Column({ name: 're_invoicing_nf', nullable: true })
  reInvoicingNf?: string;

  @Column({ name: 're_invoicing_weight_in_kg', type: 'float4', nullable: true })
  reInvoicingWeightInKg?: number;

  @Column({ name: 're_invoicing_quantity', type: 'int', nullable: true })
  reInvoicingQuantity?: number;

  @Column({ name: 're_invoicing_value', type: 'float4', nullable: true })
  reInvoicingValue?: number;

  @Column({ name: 'return_cause', nullable: true })
  returnCause?: string;

  @Column({ name: 'observation', nullable: true })
  observation?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}

/**
   * Data devolução
Data Faturamento
Data Refaturamento (é possivel?)
Cod empresa
Empresa
Cod produto
Produto
Cod cliente
Cliente
Cod Agente de venda (Representante)
Agente de venda (Representante)
NF Faturamento
Peso Faturamento
Valor Faturamento
Quantidade Faturamento
NF Devolução
Peso Devolução (Tem esse Campo?)
Valor Devolução (Tem esse Campo?)
Quantidade Devolução (Tem esse Campo?)
NF Refaturamento (é possivel?)
Peso Refaturamento (é possivel?)
Valor Refaturamento (é possivel?)
Quantidade Refaturamento (é possivel?)
Motivo Devolução
Informação complementar ou Observação
   */
