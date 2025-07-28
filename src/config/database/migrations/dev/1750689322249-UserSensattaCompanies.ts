import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserSensattaCompanies1750689322249 implements MigrationInterface {
  name = 'UserSensattaCompanies1750689322249';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "dev"."users_sensatta_companies" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "user_id" uuid NOT NULL, 
            "company_code" varchar NOT NULL, 
            CONSTRAINT "PK_8142f49fece0ade1dcc0012c42a" PRIMARY KEY ("id"))`);
    await queryRunner.query(`
            ALTER TABLE "dev"."users_sensatta_companies" 
            ADD CONSTRAINT "FK_59431b2d389e712c18289d9e126" FOREIGN KEY ("user_id") REFERENCES "dev"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."users_sensatta_companies" DROP CONSTRAINT "FK_59431b2d389e712c18289d9e126"`,
    );
    await queryRunner.query(`DROP TABLE "dev"."users_sensatta_companies"`);
  }
}
