import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMarketEnumTOProductLines1746467130291
  implements MigrationInterface
{
  name = 'AddMarketEnumTOProductLines1746467130291';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "dev"."market_enum" AS ENUM('external', 'internal', 'both')`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_product_lines" ADD "market" "dev"."market_enum" NOT NULL DEFAULT 'internal'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_product_lines" DROP COLUMN "market"`,
    );
    await queryRunner.query(`DROP TYPE "dev"."market_enum"`);
  }
}
