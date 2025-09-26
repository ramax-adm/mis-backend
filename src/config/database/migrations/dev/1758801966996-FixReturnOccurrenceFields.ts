import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixReturnOccurrenceFields1758801966996
  implements MigrationInterface
{
  name = 'FixReturnOccurrenceFields1758801966996';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_return_occurrences" DROP COLUMN "return_cause"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_return_occurrences" ADD "occurrence_number" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_return_occurrences" ADD "occurrence_cause" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_return_occurrences" ADD "return_type" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_return_occurrences" DROP COLUMN "return_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_return_occurrences" DROP COLUMN "occurrence_cause"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_return_occurrences" DROP COLUMN "occurrence_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_return_occurrences" ADD "return_cause" character varying`,
    );
  }
}
