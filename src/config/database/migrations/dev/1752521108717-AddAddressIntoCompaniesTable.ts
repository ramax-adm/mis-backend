import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAddressIntoCompaniesTable1752521108717
  implements MigrationInterface
{
  name = 'AddAddressIntoCompaniesTable1752521108717';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_companies" ADD "address" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_companies" ADD "neighbourd" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_companies" ADD "zipcode" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_companies" ADD "phone" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_companies" ADD "email" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_companies" ADD "state_subscription" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_companies" DROP COLUMN "state_subscription"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_companies" DROP COLUMN "email"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_companies" DROP COLUMN "phone"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_companies" DROP COLUMN "zipcode"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_companies" DROP COLUMN "neighbourd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_companies" DROP COLUMN "address"`,
    );
  }
}
