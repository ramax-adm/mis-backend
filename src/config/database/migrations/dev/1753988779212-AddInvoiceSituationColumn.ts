import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoiceSituationColumn1753988779212
  implements MigrationInterface
{
  name = 'AddInvoiceSituationColumn1753988779212';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_invoices" ADD "nf_situation" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_invoices" DROP COLUMN "situation"`,
    );
  }
}
