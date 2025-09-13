import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSensattaPaymentTermIntoOrderLines1757708285368
  implements MigrationInterface
{
  name = ' AddSensattaPaymentTermIntoOrderLines1757708285368';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_order_lines" ADD "payment_term" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_order_lines" DROP COLUMN "payment_term"`,
    );
  }
}
