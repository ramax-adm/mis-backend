import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSensattaClients1752180423833 implements MigrationInterface {
  name = 'CreateSensattaClients1752180423833';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dev"."sensatta_clients" 
      ("id" uuid DEFAULT uuid_generate_v4(), 
      "sensatta_code" character varying, 
      "name" character varying, 
      "fantasy_name" character varying, 
      "sales_representative_code" character varying, 
      "sales_representative_name" character varying, 
      "sales_representative_fantasy_name" character varying, 
      "state_subscrition" character varying, 
      "email" character varying, 
      "phone" character varying, 
      "uf" character varying, 
      "city" character varying,
      "zipcode" character varying, 
      "neighbourd" character varying, 
      "address" character varying, 
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), 
      CONSTRAINT "PK_ca8a18d88b31f6562f3c758cf60" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."sensatta_clients"`);
  }
}
