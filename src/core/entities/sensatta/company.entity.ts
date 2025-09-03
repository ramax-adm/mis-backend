import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'sensatta_companies' })
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sensatta_code' })
  sensattaCode: string;

  @Column()
  city: string;

  @Column()
  uf: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  neighbourd: string;

  @Column({ nullable: true })
  zipcode: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ name: 'state_subscription', nullable: true })
  stateSubscription: string;

  @Column()
  name: string;

  @Column({ name: 'fantasy_name' })
  fantasyName: string;

  @Column({ name: 'price_table_number_car', default: null, nullable: true })
  priceTableNumberCar?: string; // preço carreta

  @Column({ name: 'price_table_number_truck', default: null, nullable: true })
  priceTableNumberTruck?: string; // preço bitruck

  @Column({ name: 'is_considered_on_stock', type: 'boolean', default: 'false' })
  isConsideredOnStock: boolean;

  @Column({
    name: 'is_considered_on_freight',
    type: 'boolean',
    default: 'false',
  })
  isConsideredOnFreight: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
