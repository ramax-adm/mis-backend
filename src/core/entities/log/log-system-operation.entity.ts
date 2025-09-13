import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ schema: 'log', name: 'log_system_operations' })
export class LogSystemOperation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ name: 'method', type: 'varchar' })
  method: string;

  @Column({ name: 'uri', type: 'varchar' })
  uri: string;

  @Column({ name: 'payload', type: 'json', nullable: true })
  payload: string;

  @Column({ name: 'response', type: 'json' })
  response: string;

  @Column({ name: 'status_code', type: 'int' })
  statusCode: number;

  @Column({ name: 'duration_time_in_seconds', type: 'int' })
  durationTimeInSeconds: number;

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
