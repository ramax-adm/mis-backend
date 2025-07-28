import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCashFlowProducts1746555896451 implements MigrationInterface {
  name = 'AddCashFlowProducts1746555896451';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "dev"."cash_flow_products" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "name" character varying NOT NULL, 
            "income_key" character varying NOT NULL, 
            "quarter_key" character varying NOT NULL, 
            "market" character varying  NOT NULL, 
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_021e4d359fd290f95f2b1569011" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."cash_flow_products"`);
  }
}
