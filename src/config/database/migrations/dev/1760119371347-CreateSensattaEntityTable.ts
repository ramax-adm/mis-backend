import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSensattaEntityTable1760119371347
  implements MigrationInterface
{
  name = 'CreateSensattaEntityTable1760119371347';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "dev"."sensatta_entities" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "sensatta_id" character varying, 
            "sensatta_code" character varying, 
            "name" character varying, 
            "fantasy_name" character varying, 
            "email" character varying, 
            "phone" character varying, 
            "uf" character varying, 
            "city" character varying, 
            "zipcode" character varying, 
            "neighbourd" character varying, 
            "address" character varying, 
            "relations" character varying,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_76f30f3fe6e3fba6cf890df7d6a" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."sensatta_entities"`);
  }
}
