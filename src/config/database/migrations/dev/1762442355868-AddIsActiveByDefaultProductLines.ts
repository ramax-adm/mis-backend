import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveByDefaultProductLines1762442355868
  implements MigrationInterface
{
  name = 'AddIsActiveByDefaultProductLines1762442355868';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_product_lines" ALTER COLUMN "is_active" SET DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_product_lines" ALTER COLUMN "is_active" SET DEFAULT false`,
    );
  }
}
