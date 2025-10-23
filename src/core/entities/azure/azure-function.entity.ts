import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'azure', name: 'azure_function_list' })
export class AzureFunction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'azure_function_id', type: 'varchar', unique: true })
  azureFunctionId: string;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'key', type: 'varchar' })
  key: string;

  @Column({ name: 'description', type: 'varchar', nullable: true })
  description: string;

  @Column({ name: 'http_trigger', type: 'varchar' })
  httpTrigger: string;

  @Column({ name: 'default_params', type: 'jsonb', nullable: true })
  defaultParams?: Record<string, any>;

  @Column({ name: 'cron_expression', type: 'varchar' })
  cronExpression: string;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'varchar', nullable: true })
  createdBy?: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date;

  @Column({ name: 'updated_by', type: 'varchar', nullable: true })
  updatedBy?: string;
}
