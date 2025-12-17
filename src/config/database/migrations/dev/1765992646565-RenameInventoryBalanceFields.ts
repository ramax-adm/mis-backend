import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameInventoryBalanceFields1765992646565
  implements MigrationInterface
{
  name = 'RenameInventoryBalanceFields1765992646565';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_inventory_balance" RENAME COLUMN "phisical_quantity" TO "previous_quantity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_inventory_balance" RENAME COLUMN "phisical_weight_in_kg" TO "previous_weight_in_kg"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_inventory_balance" RENAME COLUMN "previous_weight_in_kg" TO "phisical_weight_in_kg"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_inventory_balance" RENAME COLUMN "previous_quantity" TO "phisical_quantity"`,
    );
  }
}
