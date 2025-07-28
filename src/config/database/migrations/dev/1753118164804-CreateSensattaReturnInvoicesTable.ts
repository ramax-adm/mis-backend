import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSensattaReturnInvoicesTable1753118164804
  implements MigrationInterface
{
  name = 'CreateSensattaReturnInvoicesTable1753118164804';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dev"."sensatta_return_invoices" 
      ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
      "date" date, 
      "invoice_date" date, 
      "re_invoicing_date" date, 
      "company_code" character varying, 
      "company_name" character varying, 
      "product_code" character varying, 
      "product_name" character varying, 
      "client_code" character varying, 
      "client_name" character varying, 
      "sales_representative_code" character varying, 
      "sales_representative_name" character varying, 
      "invoice_nf" character varying, 
      "invoice_weight_in_kg" real, 
      "invoice_quantity" integer, 
      "invoice_value" real, 
      "return_nf" character varying, 
      "return_weight_in_kg" real, 
      "return_quantity" integer, 
      "return_value" real, 
      "re_invoicing_nf" character varying, 
      "re_invoicing_weight_in_kg" real, 
      "re_invoicing_quantity" integer,
      "re_invoicing_value" real, 
      "return_cause" character varying, 
      "observation" character varying, 
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
      CONSTRAINT "PK_d1365d7653d15ab9fa9edb57f80" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."sensatta_return_invoices"`);
  }
}
