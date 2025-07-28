import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSensattaIncomingBatches1744647742856
  implements MigrationInterface
{
  name = ' CreateSensattaIncomingBatches1744647742856';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "dev"."sensatta_incoming_batches" 
      ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
      "production_date" date, 
      "slaughter_date" date, 
      "print_date" date, 
      "due_date" date, 
      "movement_type" character varying NOT NULL, 
      "company_code" character varying NOT NULL, 
      "product_line_code" character varying NOT NULL, 
      "product_code" character varying NOT NULL, 
      "warehouse_code" character varying NOT NULL, 
      "box_amount" real NOT NULL, 
      "quantity" integer NOT NULL, 
      "weight_in_kg" real NOT NULL, 
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      CONSTRAINT "PK_70155246630bbc3e9b57e454a18" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."sensatta_incoming_batches"`);
  }
}
