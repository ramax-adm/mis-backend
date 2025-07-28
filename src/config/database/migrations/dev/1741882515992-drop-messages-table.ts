import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropMessagesTable1741882515992 implements MigrationInterface {
  name = 'DropMessagesTable1741882515992';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."messages"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dev"."messages" ("id" SERIAL NOT NULL,
                                "executed_count" integer NOT NULL,
                                "executed_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                                CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`,
    );
  }
}
