import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateColumnsForAppWebpagesAndFreightCompaniesConsultations1760983247777
  implements MigrationInterface
{
  name =
    'UpdateColumnsForAppWebpagesAndFreightCompaniesConsultations1760983247777';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."antt_freight_companies_consultations" RENAME COLUMN "sensatta_code" TO "freight_company_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."app_webpages" ADD "is_active" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."app_webpages" DROP COLUMN "is_active"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."antt_freight_companies_consultations" RENAME COLUMN "freight_company_code" TO "sensatta_code"`,
    );
  }
}
