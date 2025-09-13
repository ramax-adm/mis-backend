import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLogAuthAccessAttemptTable1757609584990
  implements MigrationInterface
{
  name = 'CreateLogAuthAccessAttemptTable1757609584990';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "log"."log_auth_access_attempts"
      ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
      "user_id" uuid NOT NULL, 
      "access_agent" character varying NOT NULL,
      "ip_address" character varying NOT NULL, 
      "duration_time_in_seconds" integer NOT NULL, 
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
      CONSTRAINT "PK_87f96afde9b184edda91781bed7" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "log"."log_auth_access_attempts"`);
  }
}
