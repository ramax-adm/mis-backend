import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsAuthPageIntoAppWebpagesTable1755704746657
  implements MigrationInterface
{
  name = 'AddIsAuthPageIntoAppWebpagesTable1755704746657';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."app_webpages" ADD "is_auth_page" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."app_webpages" DROP COLUMN "is_auth_page"`,
    );
  }
}
