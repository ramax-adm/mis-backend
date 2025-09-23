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

@Entity({ name: 'temp_livro_fiscal' })
export class TempLivroFiscal {
  /**
     * 	V.codigo_empresa,
	'SAIDA' TIPO,
	v.data_emissao,
	V.data_saida_entrada ENTRADA,
	V.categoria,
	C.DESCRICAO,
	V.documento,
	V.razao_social,
	V.descricao,
	V.cfop,
	CFOP.NOME,
	v.ncm,
	v.quantidade,
	v.valor_unitario,
	v.valor_total,
	V.valor_contabil,
	v.cst_icms,
	v.aliquota_icms,
	v.base_calculo_icms,
	v.valor_icms,
	v.cst_pis,
	v.aliquota_pis,
	v.base_calculo_pis,
	v.valor_pis,
	v.aliquota_cofins,
	v.valor_cofins,
	v.chave_acesso
     */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  CODIGO_EMPRESA: string;

  @Column({ type: 'varchar', nullable: true })
  TIPO: string;

  @Column({ type: 'date', nullable: true })
  DATA_EMISSAO: Date;

  @Column({ type: 'date', nullable: true })
  ENTRADA: Date;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  CATEGORIA: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  CATEGORIA_DESCRICAO: string;

  @Column({ type: 'varchar', nullable: true })
  DOCUMENTO: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  RAZAO_SOCIAL: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  DESCRICAO: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  CFOP: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  NOME: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  NCM: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  QUANTIDADE: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  VALOR_UNITARIO: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  VALOR_TOTAL: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  VALOR_CONTABIL: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  CST_ICMS: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  ALIQUOTA_ICMS: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  BASE_CALCULO_ICMS: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  VALOR_ICMS: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  CST_PIS: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  ALIQUOTA_PIS: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  BASE_CALCULO_PIS: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  VALOR_PIS: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  ALIQUOTA_COFINS: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  VALOR_COFINS: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  CHAVE_ACESSO: string;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
