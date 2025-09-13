import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixFieldsIntoNFs1757561371455 implements MigrationInterface {
  name = 'FixFieldsIntoNFs1757561371455';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_orders" RENAME COLUMN "order_number" TO "order_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_invoices" RENAME COLUMN "request_id" TO "order_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_invoices" ADD "nf_id" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_invoices" DROP COLUMN "nf_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_invoices" RENAME COLUMN "order_id" TO  "request_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_orders" RENAME COLUMN "order_id" TO "order_number"`,
    );
  }
}
