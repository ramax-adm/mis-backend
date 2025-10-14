import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAzureFunctionJobEvent1760133176555
  implements MigrationInterface
{
  name = 'CreateAzureFunctionJobEvent1760133176555';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "azure"."log_azure_function_job_event" 
      ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
      "function_job_id" uuid NOT NULL, 
      "log_level" character varying NOT NULL,
      "log" jsonb NOT NULL, 
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
      CONSTRAINT "PK_59def96d739f09c928fbdcbda5f" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE "azure"."log_azure_function_job_event"`,
    );
  }
}
