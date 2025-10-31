import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'sensatta_accounts_receivable' })
export class AccountReceivable {
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

  @Column({ name: 'receivable_number', type: 'varchar', nullable: true })
  receivableNumber?: string;

  @Column({ name: 'issue_date', type: 'date', nullable: true })
  issueDate?: Date;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate?: Date;

  @Column({ name: 'recognition_date', type: 'date', nullable: true })
  recognitionDate?: Date;

  @Column({ name: 'loss_recognition_date', type: 'date', nullable: true })
  lossRecognitionDate?: Date;

  @Column({ name: 'status', type: 'varchar', nullable: true })
  status?: string;

  @Column({ name: 'client_code', type: 'varchar', nullable: true })
  clientCode?: string;

  @Column({ name: 'client_name', type: 'varchar', nullable: true })
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

  @Column({ name: 'person_type', type: 'varchar', nullable: true })
  personType?: string;

  @Column({ name: 'currency', type: 'varchar', nullable: true })
  currency?: string;

  @Column({ name: 'value', type: 'float4', nullable: true })
  value?: number;

  @Column({ name: 'open_value', type: 'float4', nullable: true })
  openValue?: number;

  @Column({ name: 'sensatta_created_by', type: 'varchar', nullable: true })
  sensattaCreatedBy?: string;

  @Column({ name: 'sensatta_approved_by', type: 'varchar', nullable: true })
  sensattaApprovedBy?: string;

  @Column({ name: 'observation', type: 'text', nullable: true })
  observation?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
