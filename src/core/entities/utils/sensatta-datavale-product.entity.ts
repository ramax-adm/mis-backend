import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Tabela de DE/PARA
@Entity({ name: 'utils_sensatta_datavale_products' })
export class SensattaDatavaleProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'datavale_code' })
  datavaleCode: string; // sequencial produto

  @Column({ name: 'sensatta_code' })
  sensattaCode: string; // sequencial item preco

  @Column({ name: 'datavale_name' })
  datavaleName: string; // tabela preco -> sequencial tabela preco

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
