import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSensattaOrdersTable1757439188086
  implements MigrationInterface
{
  name = ' CreateSensattaOrdersTable1757439188086';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dev"."sensatta_orders" 
      ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
      "billing_date" date, 
      "issue_date" date, 
      "company_code" character varying, 
      "company_name" character varying, 
      "order_number" character varying, 
      "situation" character varying, 
      "client_code" character varying, 
      "client_name" character varying, 
      "sales_representative_code" character varying,
      "sales_representative_name" character varying, 
      "category" character varying, 
      "product_line_code" character varying, 
      "product_line_name" character varying, 
      "product_code" character varying, 
      "product_name" character varying, 
      "quantity" integer, 
      "weight_in_kg" real, 
      "cost_value" real, 
      "discount_promotion_value" real, 
      "sale_unit_value" real, 
      "reference_table_unit_value" real, 
      "total_value" real, 
      "receivable_title_value" real, 
      "reference_table_id" character varying, 
      "reference_table_description" character varying,
      "freight_company_id" character varying, 
      "freight_company_name" character varying,
      "description" character varying, 
      "receivable_title_id" character varying, 
      "receivable_title_number" character varying, 
      "receivable_title_observation" character varying, 
      "account_group_code" character varying, 
      "account_group_name" character varying, 
      "account_code" character varying, 
      "account_name" character varying, 
      "nf_id" character varying, 
      "nf_number" character varying, 
      "cfop_code" character varying, 
      "cfop_description" character varying, 
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
      CONSTRAINT "PK_6b45dfb1cd6f7be844b45aafb37" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."sensatta_orders"`);
  }
}
