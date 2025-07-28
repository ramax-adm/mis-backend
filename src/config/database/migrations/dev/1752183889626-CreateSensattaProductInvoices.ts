import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSensattaProductInvoices1752183889626
  implements MigrationInterface
{
  name = 'CreateSensattaProductInvoices1752183889626';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dev"."sensatta_product_invoices" 
      ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
      "date" date, 
      "nf_type" character varying, 
      "client_type_code" character varying, 
      "client_type_name" character varying, 
      "company_code" character varying, 
      "cfop_code" character varying, 
      "cfop_description" character varying, 
      "nf_number" character varying, 
      "request_id" character varying, 
      "client_code" character varying, 
      "client_name" character varying, 
      "product_code" character varying, 
      "product_name" character varying, 
      "box_amount" integer, 
      "weight_in_kg" real, 
      "unit_price" real, 
      "total_price" real, 
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
      CONSTRAINT "PK_07592df1fd07ebb9e8722d678a3" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."sensatta_product_invoices"`);
  }
}
