import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingCurrencyAndMarketFieldsIntoOrderLinesTable1757947734096
  implements MigrationInterface
{
  name = 'AddMissingCurrencyAndMarketFieldsIntoOrderLinesTable1757947734096';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_order_lines" ADD "market" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_order_lines" ADD "currency" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_order_lines" DROP COLUMN "currency"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_order_lines" DROP COLUMN "market"`,
    );
  }
}
