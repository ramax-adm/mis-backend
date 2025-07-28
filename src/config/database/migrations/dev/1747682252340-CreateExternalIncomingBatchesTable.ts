import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExternalIncomingBatchesTable1747682252340
  implements MigrationInterface
{
  name = 'CreateExternalIncomingBatchesTable1747682252340';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "dev"."external_incoming_batches" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "integration_system" character varying NOT NULL, 
            "product_internal_code" character varying NOT NULL, 
            "product_code" character varying NOT NULL, 
            "product_line_code" character varying NOT NULL, 
            "production_date" date NOT NULL, 
            "due_date" date NOT NULL, 
            "box_amount" real NOT NULL, 
            "quantity" integer NOT NULL, 
            "weight_in_kg" real NOT NULL, 
            "company_code" character varying NOT NULL, 
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_d47431a7c3ebdea5fa7b64cd78d" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."external_incoming_batches"`);
  }
}
