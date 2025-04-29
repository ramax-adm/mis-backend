import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameProductLineIdColumn1744636091022
  implements MigrationInterface
{
  name = ' RenameProductLineIdColumn1744636091022';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_products" RENAME COLUMN "product_line_code" TO "product_line_id"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_products" RENAME COLUMN "product_line_id" TO "product_line_code"`,
    );
  }
}
