import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUtilsStorageSyncedFileTable1750968200255
  implements MigrationInterface
{
  name = 'CreateUtilsStorageSyncedFileTable1750968200255';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dev"."utils_storage_synced_file" 
      ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
      "storage_type" character varying NOT NULL, 
      "entity" character varying NOT NULL, 
      "file_url" character varying NOT NULL, 
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
      CONSTRAINT "PK_40bff6bf63cb7379f3b7c8d1614" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."utils_storage_synced_file"`);
  }
}
