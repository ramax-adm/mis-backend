import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSensattaFreightCompaniesTable1756909313675
  implements MigrationInterface
{
  name = 'CreateSensattaFreightCompaniesTable1756909313675';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "dev"."sensatta_freight_companies" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "sensatta_id" character varying, 
            "sensatta_code" character varying, 
            "name" character varying, 
            "fantasy_name" character varying, 
            "cnpj" character varying, 
            "state_subscription" character varying, 
            "zipcode" character varying, 
            "neighborhood" character varying, 
            "address" character varying, 
            "city" character varying, 
            "uf" character varying, 
            "email" character varying, 
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_a83aa1c343b7520a042774b7e22" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."sensatta_freight_companies"`);
  }
}
