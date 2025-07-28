import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHolidayAndUserTables1741880926868
  implements MigrationInterface
{
  name = 'CreateHolidayAndUserTables1741880926868';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "dev"."holidays" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                                                          "name" character varying NOT NULL,
                                                          "date" date NOT NULL,
                                                          "weekday" character varying NOT NULL,
                                                           CONSTRAINT "PK_3646bdd4c3817d954d830881dfe" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "dev"."users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                                                        "name" character varying NOT NULL,
                                                        "cpf" character varying NOT NULL,
                                                        "email" character varying NOT NULL,
                                                        "password" character varying NOT NULL,
                                                        "refresh_token" character varying,
                                                        "password_token" character varying,
                                                        "role" character varying NOT NULL,
                                                        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                                                        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                                                        "is_active" boolean NOT NULL DEFAULT false,
                                                        CONSTRAINT "UQ_EMAIL" UNIQUE ("email"),
                                                        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."users"`);
    await queryRunner.query(`DROP TABLE "dev"."holidays"`);
  }
}
