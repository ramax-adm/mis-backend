import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('antt_freight_companies_consultations')
export class AnttFreightCompaniesConsultation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    name: 'freight_company_code',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  freightCompanyCode?: string;

  @Column({
    name: 'freight_company',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  freightCompany?: string;

  @Column({ name: 'rnrtc_code', type: 'varchar', length: 50, nullable: true })
  rnrtcCode?: string;

  @Column({ name: 'rnrtc_status', type: 'varchar', length: 50, nullable: true })
  rnrtcStatus?: string;

  @Column({ name: 'location', type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({
    name: 'result_status',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  resultStatus?: string;

  @Column({ name: 'result_description', type: 'text', nullable: true })
  resultDescription?: string;

  @Column({ name: 'result_observation', type: 'text', nullable: true })
  resultObservation?: string;

  @Column({ name: 'registered_at', type: 'date', nullable: true })
  registeredAt?: Date;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
