import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCattleWeightInKgOnCattlePurchasesTable1767140710341
  implements MigrationInterface
{
  name = 'AddCattleWeightInKgOnCattlePurchasesTable1767140710341';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchases" ADD "cattle_weight_in_kg" real`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchases" DROP COLUMN "cattle_weight_in_kg"`,
    );
  }
}
