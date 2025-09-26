import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameReturnOccurrenceTable1758801377067
  implements MigrationInterface
{
  name = 'RenameReturnOccurrenceTable1758801377067';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev".sensatta_return_invoices RENAME TO sensatta_return_occurrences;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev".sensatta_return_occurrences RENAME TO sensatta_return_invoices;`,
    );
  }
}
