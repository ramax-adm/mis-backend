import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddToCompaniesColumnPriceTableNumber1746217947314
  implements MigrationInterface
{
  name = 'AddToCompaniesColumnPriceTableNumber1746217947314';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_companies" ADD "price_table_number" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_companies" DROP COLUMN "price_table_number"`,
    );
  }
}
