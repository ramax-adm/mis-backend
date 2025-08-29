import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingFieldsIntoIntranetDocuments1756335714215
  implements MigrationInterface
{
  name = 'AddMissingFieldsIntoIntranetDocuments1756335714215';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."intranet_documents_versions" ADD "category" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."users_intranet_documents_acceptance" ADD "ip_address" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."users_intranet_documents_acceptance" ADD "acceptance_time_in_seconds" integer NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."users_intranet_documents_acceptance" DROP COLUMN "acceptance_time_in_seconds"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."users_intranet_documents_acceptance" DROP COLUMN "ip_address"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."intranet_documents_versions" DROP COLUMN "category"`,
    );
  }
}
