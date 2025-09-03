import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsConsideredOnFreightField1756824084995
  implements MigrationInterface
{
  name = 'AddIsConsideredOnFreightField1756824084995';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_companies" ADD "is_considered_on_freight" boolean NOT NULL DEFAULT 'false'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_companies" DROP COLUMN "is_considered_on_freight"`,
    );
  }
}
