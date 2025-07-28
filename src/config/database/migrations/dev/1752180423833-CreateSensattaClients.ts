import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSensattaClients1752180423833 implements MigrationInterface {
  name = 'CreateSensattaClients1752180423833';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dev"."sensatta_clients" 
      ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
      "sensatta_code" character varying NOT NULL, 
      "name" character varying NOT NULL, 
      "fantasy_name" character varying NOT NULL, 
      "state_subscrition" character varying NOT NULL, 
      "email" character varying NOT NULL, 
      "phone" character varying NOT NULL, 
      "uf" character varying NOT NULL, 
      "city" character varying NOT NULL,
      "zipcode" character varying NOT NULL, 
      "neighbourd" character varying NOT NULL, 
      "address" character varying NOT NULL, 
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
      CONSTRAINT "PK_ca8a18d88b31f6562f3c758cf60" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."sensatta_clients"`);
  }
}
