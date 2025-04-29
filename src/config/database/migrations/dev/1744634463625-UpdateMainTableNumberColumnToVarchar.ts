import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateMainTableNumberColumnToVarchar1744634463625 implements MigrationInterface {
  name = ' UpdateMainTableNumberColumnToVarchar1744634463625';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_reference_prices" DROP COLUMN "main_table_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_reference_prices" ADD "main_table_number" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_reference_prices" DROP COLUMN "main_table_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_reference_prices" ADD "main_table_number" integer NOT NULL`,
    );
  }
}
