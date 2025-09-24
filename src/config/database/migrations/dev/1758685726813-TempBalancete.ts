import { MigrationInterface, QueryRunner } from 'typeorm';

export class TempBalancete1758685726813 implements MigrationInterface {
  name = 'TempBalancete1758685726813';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dev"."temp_balancete" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
      "EMP" character varying, 
      "AGL1" character varying, 
      "AGL2" character varying, 
      "AGL3" character varying, 
      "AGL4" character varying, 
      "CLASSIFICACAO" character varying, 
      "CONTA" character varying, 
      "DESCRICAO" character varying, 
      "CLAS" character varying, 
      "CST" character varying, 
      "F" character varying, 
      "ENTIDADE" character varying, 
      "RAZAO" character varying, 
      "O_CLAS" character varying, 
      "O_CST" character varying, 
      "O_DESC" character varying, 
      "GR" character varying, 
      "TP" character varying, 
      "SALDO_SDI" character varying, 
      "DATA_SDI" date, 
      "DEBITO" character varying, 
      "CREDITO" character varying, 
      "MOVIMENTO" character varying, 
      "DATA_SDF" date, 
      "SDF" character varying, 
      "SUBSTR_CLASS" character varying, 
      "SUBSTR_DESCRICAO" character varying, 
      "DESCRICAO_CLASS" character varying, 
      "CLASS" character varying, 
      "CLASSIFICACAO_SIMPLES" character varying, 
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
      CONSTRAINT "PK_69c062259931c678eeed6bf7bde" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."temp_balancete"`);
  }
}
