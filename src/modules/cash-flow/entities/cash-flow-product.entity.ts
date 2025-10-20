import { MarketEnum } from '@/modules/stock/enums/markets.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('cash_flow_products')
export class CashFlowProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', name: 'income_key' })
  incomeKey: string; // chave de objeto para determinar: o controle de rendimento escolhido

  @Column({ type: 'varchar', name: 'quarter_key' })
  quarterKey: string; // chave de objeto para determinar: o quarteio que o produto pertence

  @Column({ type: 'varchar' })
  market: string; // Determinação de qual mercado o produto pertence

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
