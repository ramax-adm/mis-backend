import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ schema: 'log', name: 'log_auth_access_attempts' })
export class LogAuthAccessAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', name: 'access_agent' })
  accessAgent: string;

  @Column({ type: 'varchar', name: 'ip_address' })
  ipAddress: string;

  @Column({ name: 'duration_time_in_seconds', type: 'int' })
  durationTimeInSeconds: number;

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
