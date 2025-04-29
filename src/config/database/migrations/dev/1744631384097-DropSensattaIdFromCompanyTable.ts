import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropSensattaIdFromCompanyTable1744631384097
  implements MigrationInterface
{
  name = 'DropSensattaIdFromCompanyTable1744631384097';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_companies" DROP COLUMN "sensatta_id"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."cash_flow_simulations" ALTER COLUMN "name" DROP NOT NULL`,
    );
  }
}
