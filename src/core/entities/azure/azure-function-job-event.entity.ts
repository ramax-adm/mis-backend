import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'azure', name: 'log_azure_function_job_event' })
export class AzureFunctionJobEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'function_job_id', type: 'uuid' })
  functionJobId: string;

  @Column({ name: 'log_level', type: 'varchar' })
  logLevel: string;

  @Column({ name: 'log', type: 'jsonb' })
  log: Record<string, any>;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
