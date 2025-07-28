import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUploadsTable1748261837093 implements MigrationInterface {
  name = 'CreateUploadsTable1748261837093';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "dev"."utils_uploaded_files" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "sync_name" character varying NOT NULL,
            "file_name" character varying NOT NULL,
            "extension" character varying NOT NULL,
            "file_size" integer NOT NULL,
            "file_size_unit" character varying NOT NULL,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_a5df37c0d9f76a6fc7c099a68d5" PRIMARY KEY ("id"))`);
    await queryRunner.query(`
            CREATE TABLE "dev"."utils_upload_files" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "name" character varying NOT NULL,
            "type" character varying NOT NULL,
            "inputs" text NOT NULL,
            "api_url" character varying NOT NULL,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "UQ_4f264b5a83b12d82b4d6a7b3152" UNIQUE ("type"), CONSTRAINT "PK_f59bab9dd59e9e551297760ac60" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."utils_upload_files"`);
    await queryRunner.query(`DROP TABLE "dev"."utils_uploaded_files"`);
  }
}
