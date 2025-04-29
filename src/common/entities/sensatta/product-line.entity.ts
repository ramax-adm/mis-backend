import {
  Column,
  CreateDateColumn,
  Entity,
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

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
