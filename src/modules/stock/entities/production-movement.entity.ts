import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'sensatta_production_movements' })
export class ProductionMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', nullable: true })
  date?: Date; // data

  @Column({ name: 'company_code', comment: 'codigo empresa', nullable: true })
  companyCode?: string; // codigo empresa

  @Column({
    name: 'movement_type',
    comment: 'movimentação (entrada e saida)',
    nullable: true,
  })
  movementType?: string;

  @Column({
    name: 'operation_type',
    comment: 'especie de movimentação (reprocesso, padrao e etc)',
    nullable: true,
  })
  operationType?: string;

  @Column({
    name: 'purchase_cattle_order_id',
    comment: 'ordem compra',
    nullable: true,
  })
  purchaseCattleOrderId?: string; // ordem compra

  @Column({ name: 'product_code', comment: 'codigo produto', nullable: true })
  productCode?: string; // cod produto

  @Column({
    name: 'product_name',
    comment: 'descricao produto',
    nullable: true,
  })
  productName?: string; // produto

  @Column({ name: 'product_quarter', comment: 'quarteio', nullable: true })
  productQuarter?: string; // quarteio

  @Column({
    name: 'weight_in_kg',
    type: 'float4',
    comment: 'peso kg',
    nullable: true,
  })
  weightInKg?: number; // peso kg

  @Column({ type: 'int4', comment: 'pecas', nullable: true })
  quantity?: number; // peças

  @Column({ type: 'int4', comment: 'quatidade caixas', nullable: true })
  boxQuantity?: number; // quantidade caixas

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
