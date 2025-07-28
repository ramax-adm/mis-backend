import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFunruralAndBalanceWeightFieldsIntoCattlePurchase1752519068554 implements MigrationInterface {
  name = 'AddFunruralAndBalanceWeightFieldsIntoCattlePurchase1752519068554';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchases" ADD "balance_weight_in_arroba" real`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchases" ADD "funrural_price" real`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchases" ADD "purchase_liquid_price" real`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchases" DROP COLUMN "purchase_liquid_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchases" DROP COLUMN "funrural_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchases" DROP COLUMN "balance_weight_in_arroba"`,
    );
  }
}
