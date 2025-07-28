import { User } from '@/modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ParameterSalesDeductionProductLine } from './parameter-sales-deduction-product-line.entity';
import { UnitTypesEnum } from '@/modules/utils/enums/unit-types.enum';
import { MarketEnum } from '@/core/enums/sensatta/markets.enum';

@Entity({ name: 'params_sales_deductions' })
export class ParameterSalesDeduction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  value: number;

  @Column()
  market: MarketEnum;

  @Column()
  companyCode: string;

  @Column()
  unit: UnitTypesEnum;

  @OneToMany(
    () => ParameterSalesDeductionProductLine,
    (item) => item.paramSaleDeduction,
  )
  paramSaleDeductionProductLines: ParameterSalesDeductionProductLine[];

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdById: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedById?: string;

  @Column({ name: 'deleted_by', type: 'uuid', nullable: true })
  deletedById?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'deleted_by' })
  deletedBy?: User;
}
