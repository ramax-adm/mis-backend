import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInventoryItemsAndTraceabilityTables1760586887479
  implements MigrationInterface
{
  name = 'CreateInventoryItemsAndTraceabilityTables1760586887479';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dev"."sensatta_inventory_items" 
      ("id" uuid NOT NULL DEFAULT uuid_generate_v4()
      , "inventory_id" character varying
      , "box_number" character varying
      , "production_date" date
      , "due_date" date
      , "product_id" character varying
      , "product_code" character varying
      , "product_name" character varying
      , "sif_code" character varying
      , "weight_in_kg" real
      , "tare_weight_in_kg" real
      , "sensatta_created_by" character varying
      , "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      , CONSTRAINT "PK_b8557bd0763e307b461698fccca" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "dev"."sensatta_inventory_item_traceability" ("id" uuid NOT NULL DEFAULT uuid_generate_v4()
      , "inventory_id" character varying
      , "box_number" character varying
      , "weight_in_kg" real
      , "tare_weight_in_kg" real
      , "operation" character varying
      , "status" character varying
      , "line1" character varying
      , "line2" character varying
      , "line3" character varying
      , "line4" character varying
      , "line5" character varying
      , "line6" character varying
      , "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      , CONSTRAINT "PK_5114d9d6f8fe37e129fe4a8d056" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE "dev"."sensatta_inventory_item_traceability"`,
    );
    await queryRunner.query(`DROP TABLE "dev"."sensatta_inventory_items"`);
  }
}
