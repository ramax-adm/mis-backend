import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'sensatta_inventory_balance' })
export class InventoryBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'inventory_id', nullable: true })
  inventoryId?: string;

  @Column({ name: 'product_code', nullable: true })
  productCode?: string;

  @Column({ name: 'product_name', nullable: true })
  productName?: string;

  @Column({ name: 'inventory_quantity', type: 'float4', nullable: true })
  inventoryQuantity?: number;

  @Column({ name: 'inventory_weight_in_kg', type: 'float4', nullable: true })
  inventoryWeightInKg?: number;

  @Column({ name: 'phisical_quantity', type: 'float4', nullable: true })
  phisicalQuantity?: number;

  @Column({ name: 'phisical_weight_in_kg', type: 'float4', nullable: true })
  phisicalWeightInKg?: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
