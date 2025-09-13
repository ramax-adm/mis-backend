import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameOrderLinesTable1757677652088 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_orders" RENAME TO "sensatta_order_lines"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_order_lines" RENAME TO "sensatta_orders"`,
    );
  }
}
