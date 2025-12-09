import { MigrationInterface, QueryRunner } from 'typeorm';

export class InvoicesAlterBoxAmountToQuantityField1765226984937
  implements MigrationInterface
{
  name = 'InvoicesAlterBoxAmountToQuantityField1765226984937';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_invoices" RENAME COLUMN "box_amount" TO "quantity"`,
    );
    await queryRunner.query(`
            ALTER TABLE "dev"."sensatta_invoices" ALTER COLUMN quantity TYPE real
            USING quantity::real
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter tipo float → int
    await queryRunner.query(`
    ALTER TABLE "dev"."sensatta_invoices"
    ALTER COLUMN quantity TYPE integer
    USING quantity::integer
  `);

    // Reverter o rename
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_invoices" RENAME COLUMN "quantity" TO "box_amount"`,
    );
  }
}
