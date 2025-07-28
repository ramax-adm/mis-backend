import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCattlePurchaseTable1751299947864
  implements MigrationInterface
{
  name = 'CreateCattlePurchaseTable1751299947864';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "dev"."sensatta_cattle_purchases" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "slaughter_date" date, 
            "purchase_cattle_order_id" character varying, 
            "cattle_owner_code" character varying, 
            "cattle_owner_name" character varying, 
            "company_code" character varying,
            "company_name" character varying, 
            "cattle_advisor_code" character varying, 
            "cattle_advisor_name" character varying, 
            "cattle_quantity" integer, 
            "cattle_classification" character varying, 
            "cattle_weight_in_arroba" character varying, 
            "payment_term" integer, 
            "freight_price" real, 
            "purchase_price" real, 
            "commission_price" real, 
            "total_value" real, 
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "PK_c52babae5e9db7c21e6b8adab19" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."sensatta_cattle_purchases"`);
  }
}
