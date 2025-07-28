import { MarketEnum } from '@/core/enums/sensatta/markets.enum';
import { ParameterSalesDeductionProductLine } from '@/modules/parameters/entities/parameter-sales-deduction-product-line.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'sensatta_product_lines' })
export class ProductLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sensatta_id' })
  sensattaId: string; // sequencial linha

  @Column({ name: 'sensatta_code' })
  sensattaCode: string; // codigo linha

  @Column()
  name: string; // descricao

  @Column()
  acronym: string; // sigla

  @Column({ name: 'is_considered_on_stock', type: 'boolean', default: 'false' })
  isConsideredOnStock: boolean;

  @Column({
    type: 'enum',
    enum: MarketEnum,
    enumName: 'market_enum',
    default: MarketEnum.MI,
  })
  market: MarketEnum;

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
}
