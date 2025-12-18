import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWarehouseFieldsInProductionMovementsTable1766077489278
  implements MigrationInterface
{
  name = 'AddWarehouseFieldsInProductionMovementsTable1766077489278';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_production_movements" ADD "warehouse_code" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_production_movements" ADD "warehouse_name" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_production_movements" DROP COLUMN "warehouse_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_production_movements" DROP COLUMN "warehouse_code"`,
    );
  }
}
