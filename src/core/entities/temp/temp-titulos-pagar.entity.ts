/**
 * Script tonha: TEMPORARIO
 */
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'temp_titulos_pagar' })
export class TempTitulosPagar {
  /**
    t.codigo_empresa,
    t.sequencial_titulo_pagar,
    f.codigo_fornecedor,
    f.cgc,
    f.razao_social,
    t.data_emissao,
    t.data_vencimento,
    t.data_baixa,
    t.numero_titulo,
    t.valor,
    t.valor_pago,
    sigma_fin.valor_aberto(t.sequencial_titulo_pagar) AS valor_aberto,
    t.codigo_tipo_baixa, 
    t.observacao,
    tipo,
    valor_atualizado,
    ne.chave_acesso_nfe chv
     */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  CODIGO_EMPRESA: string;

  @Column({ type: 'varchar', nullable: true })
  SEQUENCIAL_TITULO_PAGAR: string;

  @Column({ type: 'varchar', nullable: true })
  CODIGO_FORNECEDOR: string;

  @Column({ type: 'varchar', nullable: true })
  CGC: string;

  @Column({ type: 'varchar', nullable: true })
  RAZAO_SOCIAL: string;

  @Column({ type: 'date', nullable: true })
  DATA_EMISSAO: Date;

  @Column({ type: 'date', nullable: true })
  DATA_VENCIMENTO: Date;

  @Column({ type: 'date', nullable: true })
  DATA_BAIXA: Date;

  @Column({ type: 'varchar', nullable: true })
  NUMERO_TITULO: string;

  @Column({ type: 'float4', nullable: true })
  VALOR: number;

  @Column({ type: 'float4', nullable: true })
  VALOR_PAGO: number;

  @Column({ type: 'float4', nullable: true })
  VALOR_ABERTO: number;

  @Column({ type: 'varchar', nullable: true })
  CODIGO_TIPO_BAIXA: string;

  @Column({ type: 'varchar', nullable: true })
  OBSERVACAO: string;

  @Column({ type: 'varchar', nullable: true })
  TIPO: string;

  @Column({ type: 'float4', nullable: true })
  VALOR_ATUALIZADO: number;

  @Column({ type: 'varchar', nullable: true })
  CHV: string;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
