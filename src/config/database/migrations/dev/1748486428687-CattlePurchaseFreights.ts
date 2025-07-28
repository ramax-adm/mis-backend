import { MigrationInterface, QueryRunner } from 'typeorm';

export class CattlePurchaseFreights1748486428687 implements MigrationInterface {
  name = 'CattlePurchaseFreights1748486428687';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "dev"."sensatta_cattle_purchase_freights" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "slaughter_date" date, 
            "freight_closing_date" date, 
            "purchase_cattle_order_id" character varying, 
            "company_code" character varying, 
            "freight_company_code" character varying,
            "freight_company_name" character varying, 
            "supplier_code" character varying, 
            "supplier_name" character varying, 
            "cattle_advisor_code" character varying, 
            "cattle_advisor_name" character varying, 
            "origin_city" character varying,
            "feedlot_id" character varying, 
            "feedlot_name" character varying,
            "feedlot_km_distance" real, 
            "negotiated_km_distance" real, 
            "cattle_quantity" integer, 
            "nf_cattle_quantity" integer, 
            "reference_freight_table_price" real, 
            "negotiated_freight_price" real, 
            "nf_freight_price" real, 
            "entry_nf" character varying, 
            "complement_nf" character varying, 
            "nf_type" character varying, 
            created_at timestamptz DEFAULT now() NOT NULL,
            CONSTRAINT "PK_31218435a6cf1e0fb4321bf2560" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE "dev"."sensatta_cattle_purchase_freights"`,
    );
  }
}
