import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderCategoryAndOperationIntoInvoicesTable1762102256906
  implements MigrationInterface
{
  name = 'AddOrderCategoryAndOperationIntoInvoicesTable1762102256906';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_invoices" ADD "order_category" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_invoices" ADD "order_operation" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_invoices" DROP COLUMN "order_operation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_invoices" DROP COLUMN "order_category"`,
    );
  }
}
