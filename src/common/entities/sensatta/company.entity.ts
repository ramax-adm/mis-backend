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

  @Column()
  name: string;

  @Column({ name: 'fantasy_name' })
  fantasyName: string;

  @Column({ name: 'is_considered_on_stock', type: 'boolean', default: 'false' })
  isConsideredOnStock: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
