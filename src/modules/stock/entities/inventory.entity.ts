import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'sensatta_inventories' })
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sensatta_id', nullable: true })
  sensattaId?: string;

  @Column({ name: 'date', type: 'date', nullable: true })
  date?: Date;

  @Column({ name: 'start_inventory_date', type: 'timestamp', nullable: true })
  startInventoryDate?: Date;

  @Column({ name: 'end_inventory_date', type: 'timestamp', nullable: true })
  endInventoryDate?: string;

  @Column({ name: 'company_code', nullable: true })
  companyCode?: string;

  @Column({ name: 'company_name', nullable: true })
  companyName?: string;

  @Column({ name: 'warehouse_code', nullable: true })
  warehouseCode?: string;

  @Column({ name: 'warehouse', nullable: true })
  warehouse?: string;

  @Column({ name: 'status', nullable: true })
  status?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ name: 'synced_at', type: 'timestamptz', nullable: true })
  syncedAt?: Date;
}
