import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCattlePurchaseTable1751299947864
  implements MigrationInterface
{
  name = 'CreateCattlePurchaseTable1751299947864';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "dev"."sensatta_cattle_purchases" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "slaughter_date" date NOT NULL, 
            "purchase_cattle_order_id" character varying NOT NULL, 
            "cattle_owner_code" character varying NOT NULL, 
            "cattle_owner_name" character varying NOT NULL, 
            "company_code" character varying NOT NULL,
            "company_name" character varying NOT NULL, 
            "cattle_advisor_code" character varying NOT NULL, 
            "cattle_advisor_name" character varying NOT NULL, 
            "cattle_quantity" integer NOT NULL, 
            "cattle_classification" character varying NOT NULL, 
            "cattle_weight_in_arroba" character varying NOT NULL, 
            "payment_term" integer NOT NULL, 
            "freight_price" real NOT NULL, 
            "purchase_price" real NOT NULL, 
            "commission_price" real NOT NULL, 
            "total_value" real NOT NULL, 
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "PK_c52babae5e9db7c21e6b8adab19" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."sensatta_cattle_purchases"`);
  }
}
