import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAzureFunctionList1760133176539
  implements MigrationInterface
{
  name = 'CreateAzureFunctionList1760133176539';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "azure"."azure_function_list"
      ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
      "azure_function_id" character varying NOT NULL,
      "name" character varying NOT NULL, 
      "key" character varying NOT NULL,
      "description" character varying, 
      "http_trigger" character varying NOT NULL, 
      "cron_expression" character varying NOT NULL,
      "is_active" boolean NOT NULL DEFAULT false,
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
      "created_by" character varying, 
      "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), 
      "updated_by" character varying, 
      CONSTRAINT "UQ_a8bc68df448131009fda747d88a" UNIQUE ("azure_function_id"), 
      CONSTRAINT "PK_88eed080e04272fe5754bc65be8" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "azure"."azure_function_list"`);
  }
}
