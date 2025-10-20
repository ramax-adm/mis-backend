import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTempTitulosPagar1760968518455 implements MigrationInterface {
  name = 'CreateTempTitulosPagar1760968518455';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "dev"."temp_titulos_pagar" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),
             "CODIGO_EMPRESA" character varying,
             "SEQUENCIAL_TITULO_PAGAR" character varying,
             "CODIGO_FORNECEDOR" character varying,
             "CGC" character varying,
             "RAZAO_SOCIAL" character varying,
             "DATA_EMISSAO" date,
             "DATA_VENCIMENTO" date,
             "DATA_BAIXA" date,
             "NUMERO_TITULO" character varying,
             "VALOR" real,
             "VALOR_PAGO" real,
             "VALOR_ABERTO" real,
             "CODIGO_TIPO_BAIXA" character varying,
             "OBSERVACAO" character varying,
             "TIPO" character varying,
             "VALOR_ATUALIZADO" real,
             "CHV" character varying,
             "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
              CONSTRAINT "PK_d3e5ac65e10e47c1c8f2fc413b7" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."temp_titulos_pagar"`);
  }
}
