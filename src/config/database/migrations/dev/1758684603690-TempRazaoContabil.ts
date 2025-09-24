import { MigrationInterface, QueryRunner } from 'typeorm';

export class TempRazaoContabil1758684603690 implements MigrationInterface {
  name = 'TempRazaoContabil1758684603690';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dev"."temp_razao_contabil" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
       "ID_LANCAMENTO_CONTABIL" character varying,
       "ID_ITEM_LANCAMENTO" character varying,
       "FILIAL" character varying,
       "ORIGEM" character varying,
       "DATA" date,
       "DOCUMENTO" character varying,
       "ID_HISTORICO" character varying,
       "COMPLEMENTO" character varying,
       "CODIGO_ANALITICO" character varying,
       "ORIGEM_ANALITICA" character varying,
       "NOME" character varying,
       "TIPO" character varying,
       "CONTA" character varying,
       "CTA" character varying,
       "CLASSIFICACAO" character varying,
       "CST" character varying,
       "CST_DESCRICAO" character varying,
       "VALOR" character varying,
       "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
       CONSTRAINT "PK_646f5b74dc0a11291251fcbed76" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."temp_razao_contabil"`);
  }
}
