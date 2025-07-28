import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'sensatta_stock_balance' })
export class StockBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_line_code' })
  productLineCode: string;

  @Column({ name: 'product_line_name' })
  productLineName: string;

  @Column({ name: 'product_code' })
  productCode: string;

  @Column({ name: 'product_name' })
  productName: string;

  @Column({ name: 'company_code' })
  companyCode: string;

  @Column({ name: 'company_name' })
  companyName: string;

  @Column({ name: 'weight_in_kg', type: 'float4' })
  weightInKg: number;

  @Column({ name: 'quantity', type: 'int4' })
  quantity: number;

  @Column({ name: 'reserved_weight_in_kg', type: 'float4' })
  reservedWeightInKg: number;

  @Column({ name: 'reserved_quantity', type: 'float4' })
  reservedQuantity: number;

  @Column({ name: 'available_weight_in_kg', type: 'float4' })
  availableWeightInKg: number;

  @Column({ name: 'available_quantity', type: 'float4' })
  availableQuantity: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
