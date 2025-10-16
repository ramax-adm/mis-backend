import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'sensatta_inventory_items' })
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'inventory_id', nullable: true })
  inventoryId?: string;

  @Column({ name: 'box_number', nullable: true })
  boxNumber?: string;

  @Column({ name: 'production_date', type: 'date', nullable: true })
  productionDate?: string;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate?: Date;

  @Column({ name: 'product_id', nullable: true })
  productId?: string;

  @Column({ name: 'product_code', nullable: true })
  productCode?: string;

  @Column({ name: 'product_name', nullable: true })
  productName?: string;

  @Column({ name: 'sif_code', nullable: true })
  sifCode?: string;

  @Column({ name: 'weight_in_kg', type: 'float4', nullable: true })
  weightInKg?: number;

  @Column({ name: 'tare_weight_in_kg', type: 'float4', nullable: true })
  tareWeightInKg?: number;

  @Column({ name: 'sensatta_created_by', nullable: true })
  sensattaCreatedBy?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
