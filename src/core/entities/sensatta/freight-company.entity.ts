import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'sensatta_freight_companies' })
export class FreightCompany {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sensatta_id', nullable: true })
  sensattaId?: string;

  @Column({ name: 'sensatta_code', nullable: true })
  sensattaCode?: string;

  @Column({ name: 'name', nullable: true })
  name?: string;

  @Column({ name: 'fantasy_name', nullable: true })
  fantasyName?: string;

  @Column({ name: 'cnpj', nullable: true })
  cnpj?: string;

  @Column({ name: 'state_subscription', nullable: true })
  stateSubscription?: string;

  @Column({ name: 'zipcode', nullable: true })
  zipcode?: string;

  @Column({ name: 'neighborhood', nullable: true })
  neighborhood?: string;

  @Column({ name: 'address', nullable: true })
  address?: string;

  @Column({ name: 'city', nullable: true })
  city?: string;

  @Column({ name: 'uf', nullable: true })
  uf?: string;

  @Column({ name: 'email', nullable: true })
  email?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
