import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNameInCashFlowSimulations1744142218367
  implements MigrationInterface
{
  name = 'AddNameInCashFlowSimulations1744142218367';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."cash_flow_simulations" ADD "name" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."cash_flow_simulations" DROP COLUMN "name"`,
    );
  }
}
