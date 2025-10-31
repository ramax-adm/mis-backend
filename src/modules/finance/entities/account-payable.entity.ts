import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'sensatta_accounts_payable' })
export class AccountPayable {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ name: 'base_date', type: 'date', nullable: true })
  baseDate?: Date;

  @Column({ name: 'sensatta_id', type: 'varchar', nullable: true })
  sensattaId?: string;

  @Column({ name: 'key', type: 'varchar', nullable: true })
  key?: string;

  @Column({ name: 'company_code', type: 'varchar', nullable: true })
  companyCode?: string;

  @Column({ name: 'payment_number', type: 'varchar', nullable: true })
  paymentNumber?: string;

  @Column({ name: 'issue_date', type: 'date', nullable: true })
  issueDate?: Date;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate?: Date;

  @Column({ name: 'liquidation_date', type: 'date', nullable: true })
  liquidationDate?: Date;

  @Column({ name: 'status', type: 'varchar', nullable: true })
  status?: string;

  @Column({ name: 'supply_code', type: 'varchar', nullable: true })
  supplyCode?: string;

  @Column({ name: 'supply_name', type: 'varchar', nullable: true })
  supplyName?: string;

  @Column({ name: 'recognition_type_code', type: 'varchar', nullable: true })
  recognitionTypeCode?: string;

  @Column({ name: 'recognition_type', type: 'varchar', nullable: true })
  recognitionType?: string;

  @Column({ name: 'accounting_account', type: 'varchar', nullable: true })
  accountingAccount?: string;

  @Column({
    name: 'accounting_classification',
    type: 'varchar',
    nullable: true,
  })
  accountingClassification?: string;

  @Column({ name: 'accounting_account_name', type: 'varchar', nullable: true })
  accountingAccountName?: string;

  @Column({
    name: 'client_code',
    type: 'varchar',
    nullable: true,
  })
  clientCode?: string;

  @Column({
    name: 'client_name',
    type: 'varchar',
    nullable: true,
  })
  clientName?: string;

  @Column({
    name: 'sales_representative_code',
    type: 'varchar',
    nullable: true,
  })
  salesRepresentativeCode?: string;

  @Column({
    name: 'sales_representative_name',
    type: 'varchar',
    nullable: true,
  })
  salesRepresentativeName?: string;

  @Column({ name: 'nf_id', type: 'varchar', nullable: true })
  nfId?: string;

  @Column({ name: 'nf_number', type: 'varchar', nullable: true })
  nfNumber?: string;

  @Column({ name: 'cfop_code', type: 'varchar', nullable: true })
  cfopCode?: string;

  @Column({ name: 'cfop_description', type: 'varchar', nullable: true })
  cfopDescription?: string;

  @Column({ name: 'currency', type: 'varchar', nullable: true })
  currency?: string;

  @Column({ name: 'value', type: 'float4', nullable: true })
  value: number;

  @Column({ name: 'payed_value', type: 'float4', nullable: true })
  payedValue: number;

  @Column({ name: 'additional_value', type: 'float4', nullable: true })
  additionalValue: number;

  @Column({ name: 'sensatta_created_by', type: 'varchar', nullable: true })
  sensattaCreatedBy?: string;

  @Column({ name: 'sensatta_viewed_by', type: 'varchar', nullable: true })
  sensattaViewedBy?: string;

  @Column({ name: 'sensatta_approved_by', type: 'varchar', nullable: true })
  sensattaApprovedBy?: string;

  @Column({ name: 'sensatta_liquidated_by', type: 'varchar', nullable: true })
  sensattaLiquidatedBy?: string;

  @Column({ name: 'observation', type: 'varchar', nullable: true })
  observation?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
