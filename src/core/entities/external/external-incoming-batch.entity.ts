import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Tabela de DE/PARA
@Entity({ name: 'external_incoming_batches' })
export class ExternalIncomingBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'integration_system' })
  integrationSystem: string; // sequencial produto

  @Column({ name: 'product_internal_code' })
  productInternalCode: string; // sequencial item preco

  @Column({ name: 'product_code' })
  productCode: string; // tabela preco -> sequencial tabela preco

  @Column({ name: 'product_line_code' })
  productLineCode: string; // tabela preco -> sequencial tabela preco

  @Column({ name: 'production_date', type: 'date' })
  productionDate: Date; //

  @Column({ name: 'due_date', type: 'date' })
  dueDate: Date; // ok

  @Column({ name: 'box_amount', type: 'float4' })
  boxAmount: number; // ok

  @Column({ type: 'int4' })
  quantity: number; // ok

  @Column({ name: 'weight_in_kg', type: 'float4' })
  weightInKg: number; // ok

  @Column({ name: 'company_code' })
  companyCode: string; // ok

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
