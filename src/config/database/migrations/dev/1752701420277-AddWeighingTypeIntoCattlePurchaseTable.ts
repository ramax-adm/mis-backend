import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWeighingTypeIntoCattlePurchaseTable1752701420277
  implements MigrationInterface
{
  name = 'AddWeighingTypeIntoCattlePurchaseTable1752701420277';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchases" DROP COLUMN "balance_weight_in_arroba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchases" ADD "weighing_type" varchar`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchases" ADD "balance_weight_in_kg" real`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchases" DROP COLUMN "balance_weight_in_kg"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchases" DROP COLUMN "weighing_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchases" ADD "balance_weight_in_arroba" real`,
    );
  }
}
