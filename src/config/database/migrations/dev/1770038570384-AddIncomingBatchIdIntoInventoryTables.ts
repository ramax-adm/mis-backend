import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIncomingBatchIdIntoInventoryTables1770038570384
  implements MigrationInterface
{
  name = 'AddIncomingBatchIdIntoInventoryTables1770038570384';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_inventory_items" ADD "incoming_batch_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_inventory_item_traceability" ADD "incoming_batch_id" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_inventory_item_traceability" DROP COLUMN "incoming_batch_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_inventory_items" DROP COLUMN "incoming_batch_id"`,
    );
  }
}
