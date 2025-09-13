import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLogSystemOperationTable1757609221973
  implements MigrationInterface
{
  name = 'CreateLogSystemOperationTable1757609221973';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "log"."log_system_operations" 
      ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
      "user_id" uuid NOT NULL, 
      "method" character varying NOT NULL, 
      "uri" character varying NOT NULL, 
      "payload" json, 
      "response" json NOT NULL, 
      "status_code" integer NOT NULL, 
      "duration_time_in_seconds" integer NOT NULL, 
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
      CONSTRAINT "PK_700ad106942fbab6f23567e20cb" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "log"."log_system_operations"`);
  }
}
