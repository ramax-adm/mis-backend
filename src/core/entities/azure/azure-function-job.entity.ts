import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'azure', name: 'log_azure_function_job' })
export class AzureFunctionJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'function_id', type: 'uuid' })
  functionId: string;

  @Column({ name: 'job_title', type: 'varchar', nullable: true })
  jobTitle: string;

  @Column({ name: 'triggered_at', type: 'timestamptz' })
  triggeredAt: Date;

  @Column({ name: 'finished_at', type: 'timestamptz', nullable: true })
  finishedAt: Date;

  @Column({ name: 'status', type: 'varchar' })
  status: string;

  @Column({ name: 'status_code', type: 'int', nullable: true })
  statusCode: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'varchar', nullable: true })
  createdBy?: string;
}
