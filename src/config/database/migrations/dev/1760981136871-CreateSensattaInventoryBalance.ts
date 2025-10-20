import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSensattaInventoryBalance1760981136871
  implements MigrationInterface
{
  name = 'CreateSensattaInventoryBalance1760981136871';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "dev"."sensatta_inventory_balance" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4()
            , "inventory_id" character varying
            , "product_code" character varying
            , "product_name" character varying
            , "inventory_quantity" real
            , "inventory_weight_in_kg" real
            , "phisical_quantity" real
            , "phisical_weight_in_kg" real
            , "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            , CONSTRAINT "PK_43527e87cab627d70d344d98a58" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."sensatta_inventory_balance"`);
  }
}
