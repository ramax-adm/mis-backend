import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserWebpagesTableAndCreatedAtFields1750705646460
  implements MigrationInterface
{
  name = 'AddUserWebpagesTableAndCreatedAtFields1750705646460';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."users_sensatta_companies" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );

    await queryRunner.query(
      `CREATE TABLE "dev"."app_webpages" 
      ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
      "name" character varying,
      "page" character varying NOT NULL, 
      "is_public" bool DEFAULT false NULL,
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
      CONSTRAINT "PK_6cafca9c848e1fb3af15974ae51" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "dev"."users_app_webpages" 
      ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
      "user_id" uuid NOT NULL, 
      "page_id" uuid NOT NULL, 
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
      CONSTRAINT "PK_c6a1eb1f64540508f8843c7a291" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `ALTER TABLE "dev"."users_app_webpages" ADD CONSTRAINT "FK_7f5dcaf29f2b6d939fafb334429" FOREIGN KEY ("user_id") REFERENCES "dev"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."users_app_webpages" ADD CONSTRAINT "FK_d41f57166c5595b155cef890ac2" FOREIGN KEY ("page_id") REFERENCES "dev"."app_webpages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."users_app_webpages" DROP CONSTRAINT "FK_d41f57166c5595b155cef890ac2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."users_app_webpages" DROP CONSTRAINT "FK_7f5dcaf29f2b6d939fafb334429"`,
    );
    await queryRunner.query(`DROP TABLE "dev"."users_app_webpages"`);
    await queryRunner.query(`DROP TABLE "dev"."app_webpages"`);
    await queryRunner.query(
      `ALTER TABLE "dev"."users_sensatta_companies" DROP COLUMN "created_at"`,
    );
  }
}
