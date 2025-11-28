import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOriginAndBillingTypesInAccountsReceivable1763745139489
  implements MigrationInterface
{
  name = 'AddOriginAndBillingTypesInAccountsReceivable1763745139489';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_accounts_receivable" ADD "type" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_accounts_receivable" ADD "origin_type" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_accounts_receivable" ADD "billing_type_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_accounts_receivable" ADD "billing_type" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_accounts_receivable" DROP COLUMN "billing_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_accounts_receivable" DROP COLUMN "billing_type_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_accounts_receivable" DROP COLUMN "origin_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_accounts_receivable" DROP COLUMN "type"`,
    );
  }
}
