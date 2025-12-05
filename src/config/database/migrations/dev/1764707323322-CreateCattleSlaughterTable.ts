import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCattleSlaughterTable1764707323322
  implements MigrationInterface
{
  name = 'CreateCattleSlaughterTable1764707323322';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "dev"."sensatta_cattle_slaughters" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),
             "date" date,
             "sensatta_id" character varying,
             "purchase_cattle_order_id" character varying,
             "company_code" character varying,
             "start_date" TIMESTAMP WITH TIME ZONE,
             "end_date" TIMESTAMP WITH TIME ZONE,
             "destiny" character varying,
             "cattle_type" character varying,
             "cattle_species" character varying,
             "cattle_sex" character varying,
             "cattle_age" character varying,
             "cattle_weighing_classification" character varying,
             "quantity" integer,
             "weight_in_kg" real,
             "balance_tare_in_kg" real,
             "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
              CONSTRAINT "PK_1acd5ea286139ade2ff00a66fee" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."sensatta_cattle_slaughters"`);
  }
}
