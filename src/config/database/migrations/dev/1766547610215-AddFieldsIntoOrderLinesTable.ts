import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFieldsIntoOrderLinesTable1766547610215
  implements MigrationInterface
{
  name = 'AddFieldsIntoOrderLinesTable1766547610215';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_order_lines" ADD "payment_term_code" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_order_lines" ADD "category_code" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_order_lines" ADD "order_operation" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_order_lines" ADD "reference_table_number" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_order_lines" ADD "sale_region" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_order_lines" ADD "charge_specie_code" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_order_lines" ADD "charge_specie" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_order_lines" DROP COLUMN "charge_specie"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_order_lines" DROP COLUMN "charge_specie_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_order_lines" DROP COLUMN "sale_region"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_order_lines" DROP COLUMN "reference_table_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_order_lines" DROP COLUMN "order_operation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_order_lines" DROP COLUMN "category_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_order_lines" DROP COLUMN "payment_term_code"`,
    );
  }
}
