import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum LogType {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

@Entity('log_antt_freight_companies_consultations')
export class LogAnttFreightCompaniesConsultation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'log_type', type: 'varchar' })
  logType: LogType;

  @Column({ name: 'request_uri', type: 'varchar' })
  requestUri: string;

  @Column({ name: 'request_payload', type: 'jsonb', nullable: true })
  requestPayload: Record<string, any>;

  @Column({ name: 'response', type: 'jsonb', nullable: true })
  response: Record<string, any>;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
