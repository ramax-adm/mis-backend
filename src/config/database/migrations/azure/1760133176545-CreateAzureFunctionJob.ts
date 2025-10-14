import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAzureFunctionJob1760133176545 implements MigrationInterface {
  name = 'CreateAzureFunctionJob1760133176545';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "azure"."log_azure_function_job" 
      ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
      "function_id" uuid NOT NULL,
      "job_title" character varying,
      "triggered_at" TIMESTAMP WITH TIME ZONE NOT NULL, 
      "finished_at" TIMESTAMP WITH TIME ZONE, 
      "status" character varying NOT NULL, 
      "status_code" integer, 
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
      "created_by" character varying, 
      CONSTRAINT "PK_98bbce70e94c5ba49bbfa617380" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "azure"."log_azure_function_job"`);
  }
}
