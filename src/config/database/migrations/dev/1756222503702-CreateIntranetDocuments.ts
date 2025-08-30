import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIntranetDocuments1756222503702
  implements MigrationInterface
{
  name = 'CreateIntranetDocuments1756222503702';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "dev"."intranet_documents" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "name" character varying(255) NOT NULL, 
            "description" text, 
            "type" character varying NOT NULL, 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "created_by" uuid NOT NULL, CONSTRAINT "PK_5f809dd440429470c948332dc9a" PRIMARY KEY ("id"))`);
    await queryRunner.query(`
            CREATE TABLE "dev"."intranet_documents_versions" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "document_id" uuid NOT NULL, 
            "key" character varying(50) NOT NULL, 
            "version" character varying(50) NOT NULL, 
            "review_number" integer NOT NULL, 
            "major_changes" character varying NOT NULL, 
            "extension" character varying(10), 
            "storage_type" character varying, 
            "storage_key" character varying(255), 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "created_by" uuid NOT NULL, 
            CONSTRAINT "PK_9ced7ab28f6c1dd134584c045b0" PRIMARY KEY ("id"))`);
    await queryRunner.query(`
            CREATE TABLE "dev"."users_intranet_documents_acceptance" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "user_id" uuid NOT NULL, 
            "document_version_id" uuid NOT NULL, 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "UQ_8d09c2c843bb25f3033e166fae3" UNIQUE ("user_id", "document_version_id"), 
            CONSTRAINT "PK_e2390582f41f0b6114be1373950" PRIMARY KEY ("id"))`);
    await queryRunner.query(`
            ALTER TABLE "dev"."intranet_documents" 
            ADD CONSTRAINT "FK_98112dde47465d72b06bafff857" 
            FOREIGN KEY ("created_by") REFERENCES "dev"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`
            ALTER TABLE "dev"."intranet_documents_versions" 
            ADD CONSTRAINT "FK_a5fdada0c40a95c4d27b41933d6" 
            FOREIGN KEY ("document_id") REFERENCES "dev"."intranet_documents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`
            ALTER TABLE "dev"."intranet_documents_versions" 
            ADD CONSTRAINT "FK_3b9046d6bb4b16c4a1889724872" 
            FOREIGN KEY ("created_by") REFERENCES "dev"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`
            ALTER TABLE "dev"."users_intranet_documents_acceptance" 
            ADD CONSTRAINT "FK_66ac1104adfbfab52c9b1f8cfc4" 
            FOREIGN KEY ("user_id") REFERENCES "dev"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`
            ALTER TABLE "dev"."users_intranet_documents_acceptance" 
            ADD CONSTRAINT "FK_4d39f31cb3d987be14800e5dbcc" 
            FOREIGN KEY ("document_version_id") REFERENCES "dev"."intranet_documents_versions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."users_intranet_documents_acceptance" DROP CONSTRAINT "FK_4d39f31cb3d987be14800e5dbcc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."users_intranet_documents_acceptance" DROP CONSTRAINT "FK_66ac1104adfbfab52c9b1f8cfc4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."intranet_documents_versions" DROP CONSTRAINT "FK_3b9046d6bb4b16c4a1889724872"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."intranet_documents_versions" DROP CONSTRAINT "FK_a5fdada0c40a95c4d27b41933d6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."intranet_documents" DROP CONSTRAINT "FK_98112dde47465d72b06bafff857"`,
    );
    await queryRunner.query(
      `DROP TABLE "dev"."users_intranet_documents_acceptance"`,
    );
    await queryRunner.query(`DROP TABLE "dev"."intranet_documents_versions"`);
    await queryRunner.query(`DROP TABLE "dev"."intranet_documents"`);
  }
}
