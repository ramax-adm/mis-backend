import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'sensatta_cattle_slaughters' })
export class CattleSlaughter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'date' })
  date?: Date;

  @Column({ name: 'sensatta_id', nullable: true, type: 'varchar' })
  sensattaId?: string;

  @Column({ name: 'purchase_cattle_order_id', nullable: true, type: 'varchar' })
  purchaseCattleOrderId?: string;

  @Column({ name: 'company_code', nullable: true, type: 'varchar' })
  companyCode?: string;

  @Column({ name: 'start_date', nullable: true, type: 'timestamptz' })
  startDate?: Date;

  @Column({ name: 'end_date', nullable: true, type: 'timestamptz' })
  endDate?: Date;

  @Column({ nullable: true, type: 'varchar' })
  destiny?: string;

  @Column({ name: 'cattle_type', nullable: true, type: 'varchar' })
  cattleType?: string;

  @Column({ name: 'cattle_species', nullable: true, type: 'varchar' })
  cattleSpecies?: string;

  @Column({ name: 'cattle_sex', nullable: true, type: 'varchar' })
  cattleSex?: string;

  @Column({ name: 'cattle_age', nullable: true, type: 'varchar' })
  cattleAge?: string;

  @Column({
    name: 'cattle_weighing_classification',
    nullable: true,
    type: 'varchar',
  })
  cattleWeighingClassification?: string;

  @Column({ nullable: true, type: 'int4' })
  quantity?: string;

  @Column({ name: 'weight_in_kg', nullable: true, type: 'float4' })
  weightInKg?: string;

  @Column({ name: 'balance_tare_in_kg', nullable: true, type: 'float4' })
  balanceTareInKg?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
