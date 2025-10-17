import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'sensatta_entities' })
export class SensattaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sensatta_id', nullable: true })
  sensattaId?: string;

  @Column({ name: 'sensatta_code', nullable: true })
  sensattaCode?: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ name: 'fantasy_name', nullable: true })
  fantasyName?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  uf?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  zipcode?: string;

  @Column({ nullable: true })
  neighbourd?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  relations?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
