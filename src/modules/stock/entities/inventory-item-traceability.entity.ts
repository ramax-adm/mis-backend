import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'sensatta_inventory_item_traceability' })
export class InventoryItemTraceability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'inventory_id', nullable: true })
  inventoryId?: string;

  @Column({ name: 'box_number', nullable: true })
  boxNumber?: string;

  @Column({ name: 'weight_in_kg', type: 'float4', nullable: true })
  weightInKg?: number;

  @Column({ name: 'tare_weight_in_kg', type: 'float4', nullable: true })
  tareWeightInKg?: number;

  @Column({ name: 'operation', nullable: true })
  operation?: string;

  @Column({ name: 'status', nullable: true })
  status?: string;

  @Column({ name: 'line1', nullable: true })
  line1?: string;

  @Column({ name: 'line2', nullable: true })
  line2?: string;

  @Column({ name: 'line3', nullable: true })
  line3?: string;

  @Column({ name: 'line4', nullable: true })
  line4?: string;

  @Column({ name: 'line5', nullable: true })
  line5?: string;

  @Column({ name: 'line6', nullable: true })
  line6?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
