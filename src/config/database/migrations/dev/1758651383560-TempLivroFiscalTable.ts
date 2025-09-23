import { MigrationInterface, QueryRunner } from 'typeorm';

export class TempLivroFiscalTable1758651383560 implements MigrationInterface {
  name = 'TempLivroFiscalTable1758651383560';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dev"."temp_livro_fiscal" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
      "CODIGO_EMPRESA" character varying, 
      "TIPO" character varying, 
      "DATA_EMISSAO" date, 
      "ENTRADA" date, 
      "CATEGORIA" character varying, 
      "CATEGORIA_DESCRICAO" character varying, 
      "DOCUMENTO" character varying, 
      "RAZAO_SOCIAL" character varying, 
      "DESCRICAO" character varying, 
      "CFOP" character varying, 
      "NOME" character varying, 
      "NCM" character varying, 
      "QUANTIDADE" character varying, 
      "VALOR_UNITARIO" character varying, 
      "VALOR_TOTAL" character varying, 
      "VALOR_CONTABIL" character varying, 
      "CST_ICMS" character varying, 
      "ALIQUOTA_ICMS" character varying, 
      "BASE_CALCULO_ICMS" character varying, 
      "VALOR_ICMS" character varying, 
      "CST_PIS" character varying, 
      "ALIQUOTA_PIS" character varying, 
      "BASE_CALCULO_PIS" character varying, 
      "VALOR_PIS" character varying, 
      "ALIQUOTA_COFINS" character varying, 
      "VALOR_COFINS" character varying, 
      "CHAVE_ACESSO" character varying, 
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
      CONSTRAINT "PK_d671006a492dcdbc01c086e65fa" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."temp_livro_fiscal"`);
  }
}
