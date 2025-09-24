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

@Entity({ name: 'temp_balancete' })
export class TempBalancete {
  /**
     NVL(SD.codigo_empresa, MOV.codigo_empresa) as emp,
      SUBSTR(NVL(SD.CLASSIFICACAO, MOV.CLASSIFICACAO), 1, 1) AS AGL1,  
      SUBSTR(NVL(SD.CLASSIFICACAO, MOV.CLASSIFICACAO), 1, 4) AS AGL2,
      SUBSTR(NVL(SD.CLASSIFICACAO, MOV.CLASSIFICACAO), 1, 7) AS AGL3,
      SUBSTR(NVL(SD.CLASSIFICACAO, MOV.CLASSIFICACAO), 1, 10) AS AGL4,
       NVL(SD.CLASSIFICACAO, MOV.CLASSIFICACAO) CLASSIFICACAO,
       NVL(SD.CONTA, MOV.CONTA) CONTA,
       NVL(SD.DESCRICAO, MOV.DESCRICAO) DESCRICAO,
       NVL(SD.clas,MOV.clas) CLAS,
       NVL(SD.cst,MOV.cst) CST,
       NVL(SD.ID_FILIAL,MOV.ID_FILIAL) F,
       NVL(sd.CODIGO_ANALITICO ,MOV.CODIGO_ANALITICO) entidade,
       --NVL(SD.dac,MOV.DAC)DAC,
       NVL(SD.razao,MOV.RAZAO) RAZAO,
       nvl(sd.o_clas,mov.o_clas)o_clas,
       nvl(sd.ocst,mov.ocst)o_cst,
       nvl(sd.cst_desc,mov.cst_desc)o_desc,
       nvl(sd.id_grupo_rateio,mov.id_grupo_rateio) gr,
       nvl(sd.tipo_custo,mov.tipo_custo) tp,
       NVL(SD.SALDO,0)SALDO_SDI,
       TO_DATE(:data1,'YYYY-MM-DD')-1 as Data_SDI,
       NVL(MOV.DEBITO,0) DEBITO,
       NVL(MOV.CREDITO,0)CREDITO,
       NVL(MOV.VALOR,0) MOVIMENTO,
       TO_DATE(:data2, 'YYYY-MM-DD') as Data_SDF,
       NVL(SD.SALDO,0)+ NVL(MOV.VALOR,0) SDF
       ,BS.SUBSTR_CLASS, BS.SUBSTR_DESCRICAO,
       BS.DESCRICAO_CLASS,
       bs.class,
       BS.CLASSIFICACAO_SIMPLES
     */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  EMP: string;

  @Column({ type: 'varchar', nullable: true })
  AGL1: string;

  @Column({ type: 'varchar', nullable: true })
  AGL2: string;

  @Column({ type: 'varchar', nullable: true })
  AGL3: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  AGL4: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  CLASSIFICACAO: string;

  @Column({ type: 'varchar', nullable: true })
  CONTA: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  DESCRICAO: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  CLAS: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  CST: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  F: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  ENTIDADE: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  RAZAO: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  O_CLAS: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  O_CST: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  O_DESC: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  GR: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  TP: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  SALDO_SDI: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  DATA_SDI: Date;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  DEBITO: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  CREDITO: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  MOVIMENTO: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  DATA_SDF: Date;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  SDF: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  SUBSTR_CLASS: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  SUBSTR_DESCRICAO: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  DESCRICAO_CLASS: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  CLASS: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  CLASSIFICACAO_SIMPLES: string;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
