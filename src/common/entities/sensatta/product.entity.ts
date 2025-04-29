import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'sensatta_products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sensatta_id' })
  sensattaId: string; // sequencial produto

  @Column({ name: 'sensatta_code' })
  sensattaCode: string; // codigo produto

  @Column()
  name: string; // descricao

  @Column({ name: 'product_line_id' })
  productLineId: string; // sequencial linha

  @Column({ name: 'unit_code' })
  unitCode: string; // codigo unidade medida

  @Column({ name: 'classification_type', nullable: true })
  classificationType: string; // tipo classificacao

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
