import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'sensatta_clients' })
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sensatta_code' })
  sensattaCode: string;

  @Column()
  name: string;

  @Column({ name: 'fantasy_name' })
  fantasyName: string;

  @Column({ name: 'sales_representative_code' })
  salesRepresentativeCode: string;

  @Column({ name: 'sales_representative_name' })
  salesRepresentativeName: string;

  @Column({ name: 'sales_representative_fantasy_name' })
  salesRepresentativeFantasyName: string;

  @Column({ name: 'state_subscrition' })
  stateSubscription: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  uf: string;

  @Column()
  city: string;

  @Column()
  zipcode: string;

  @Column()
  neighbourd: string;

  @Column()
  address: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
