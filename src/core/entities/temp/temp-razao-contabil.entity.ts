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

@Entity({ name: 'temp_razao_contabil' })
export class TempRazaoContabil {
  /**
     i.id_lancamento_contabil, 
        i.id_item_lancamento, 
       FILIAL, 
       c.origem,
       C.DATA,
       C.DOCUMENTO,
       C.ID_HISTORICO,
       C.COMPLEMENTO,
       i.codigo_analitico,
       i.origem_analitica,
       entidade.nome,
       I.TIPO,
       E.conta,
       e.descricao cta,
       E.CLASSIFICACAO,
       o.codigo_objeto_custo cst,
       o.descricao cst_descricao,
       VALOR
     */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  ID_LANCAMENTO_CONTABIL?: string;

  @Column({ type: 'varchar', nullable: true })
  ID_ITEM_LANCAMENTO?: string;

  @Column({ type: 'varchar', nullable: true })
  FILIAL?: string;

  @Column({ type: 'varchar', nullable: true })
  ORIGEM?: string;

  @Column({ type: 'date', nullable: true })
  DATA?: Date;

  @Column({ type: 'varchar', nullable: true })
  DOCUMENTO?: string;

  @Column({ type: 'varchar', nullable: true })
  ID_HISTORICO?: string;

  @Column({ type: 'varchar', nullable: true })
  COMPLEMENTO?: string;

  @Column({ type: 'varchar', nullable: true })
  CODIGO_ANALITICO?: string;

  @Column({ type: 'varchar', nullable: true })
  ORIGEM_ANALITICA?: string;

  @Column({ type: 'varchar', nullable: true })
  NOME?: string;

  @Column({ type: 'varchar', nullable: true })
  TIPO?: string;

  @Column({ type: 'varchar', nullable: true })
  CONTA?: string;

  @Column({ type: 'varchar', nullable: true })
  CTA?: string;

  @Column({ type: 'varchar', nullable: true })
  CLASSIFICACAO?: string;

  @Column({ type: 'varchar', nullable: true })
  CST?: string;

  @Column({ type: 'varchar', nullable: true })
  CST_DESCRICAO?: string;

  @Column({ type: 'varchar', nullable: true })
  VALOR?: string;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
