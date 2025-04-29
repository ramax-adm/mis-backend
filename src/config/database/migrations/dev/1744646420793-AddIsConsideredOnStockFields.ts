import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsConsideredOnStockFields1744646420793
  implements MigrationInterface
{
  name = 'AddIsConsideredOnStockFields1744646420793';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_product_lines" ADD "is_considered_on_stock" boolean NOT NULL DEFAULT 'false'`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_warehouses" ADD "is_considered_on_stock" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_warehouses" ALTER COLUMN "is_active" SET DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_warehouses" ALTER COLUMN "is_active" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_warehouses" DROP COLUMN "is_considered_on_stock"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_product_lines" DROP COLUMN "is_considered_on_stock"`,
    );
  }
}
