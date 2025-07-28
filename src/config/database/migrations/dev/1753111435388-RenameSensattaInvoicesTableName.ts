import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameSensattaInvoicesTableName1753111435388
  implements MigrationInterface
{
  name = 'RenameSensattaInvoicesTableName1753111435388';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_product_invoices" RENAME TO "sensatta_invoices";`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_invoices" RENAME TO "sensatta_product_invoices";`,
    );
  }
}
