import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSensattaInventoriesTable1760461956236
  implements MigrationInterface
{
  name = 'CreateSensattaInventoriesTable1760461956236';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "dev"."sensatta_inventories" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "sensatta_id" character varying, 
            "date" date, 
            "start_inventory_date" TIMESTAMP WITH TIME ZONE, 
            "end_inventory_date" TIMESTAMP WITH TIME ZONE, 
            "company_code" character varying, 
            "company_name" character varying, 
            "warehouse_code" character varying, 
            "warehouse" character varying, 
            "status" character varying, 
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
            "synced_at" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "PK_4460758f292dfd63858e77b9dd7" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."sensatta_inventories"`);
  }
}
