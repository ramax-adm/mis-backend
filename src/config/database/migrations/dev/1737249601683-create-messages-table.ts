import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMessagesTable1737249601683 implements MigrationInterface {
  name = ' CreateMessagesTable1737249601683';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dev"."messages" ("id" SERIAL NOT NULL,
                                "executed_count" integer NOT NULL,
                                "executed_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                                CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."messages"`);
  }
}
