import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductClassificationType1745516921553
  implements MigrationInterface
{
  name = 'AddProductClassificationType1745516921553';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_products" ADD "classification_type" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_products" DROP COLUMN "classification_type"`,
    );
  }
}
