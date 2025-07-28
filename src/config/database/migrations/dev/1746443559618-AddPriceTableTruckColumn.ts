import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPriceTableTruckColumn1746443559618
  implements MigrationInterface
{
  name = 'AddPriceTableTruckColumn1746443559618';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_companies" RENAME COLUMN "price_table_number" TO "price_table_number_car"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_companies" ADD "price_table_number_truck" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_companies" DROP COLUMN "price_table_number_truck"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_companies" RENAME COLUMN "price_table_number_car" TO "price_table_number"`,
    );
  }
}
