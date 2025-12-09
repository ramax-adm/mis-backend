import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'temp_historico_refaturamento' })
export class TempHistoricoRefaturamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'PEDIDO_FATURAMENTO', nullable: true })
  pedidoFaturamento?: string;

  @Column({ name: 'NF_FATURAMENTO', nullable: true })
  nfFaturamento?: string;

  @Column({ name: 'BO', nullable: true })
  bo?: string;

  @Column({ name: 'NF_DEVOLUCAO', nullable: true })
  nfDevolucao?: string;

  @Column({ name: 'SEQUENCIA_REFATURAMENTO', nullable: true })
  sequenciaFaturamento?: string;

  @Column({ name: 'PEDIDO_REFATURAMENTO', nullable: true })
  pedidoRefaturamento?: string;

  @Column({ name: 'NF_REFATURAMENTO', nullable: true })
  nfRefaturamento?: string;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
