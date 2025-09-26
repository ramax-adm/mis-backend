import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIntoReturnOccurrencesUnitValues1758811462533
  implements MigrationInterface
{
  name = 'AddIntoReturnOccurrencesUnitValues1758811462533';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_return_occurrences" ADD "invoice_unit_value" real`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_return_occurrences" ADD "return_unit_value" real`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_return_occurrences" ADD "re_invoicing_unit_value" real`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_return_occurrences" DROP COLUMN "re_invoicing_unit_value"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_return_occurrences" DROP COLUMN "return_unit_value"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_return_occurrences" DROP COLUMN "invoice_unit_value"`,
    );
  }
}
