import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStockBalanceTable1751306141114
  implements MigrationInterface
{
  name = 'CreateStockBalanceTable1751306141114';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "dev"."sensatta_stock_balance" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "product_line_code" character varying NOT NULL, 
            "product_line_name" character varying NOT NULL, 
            "product_code" character varying NOT NULL, 
            "product_name" character varying NOT NULL, 
            "company_code" character varying NOT NULL, 
            "company_name" character varying NOT NULL, 
            "weight_in_kg" real NOT NULL, 
            "quantity" real NOT NULL, 
            "reserved_weight_in_kg" real NOT NULL, 
            "reserved_quantity" real NOT NULL, 
            "available_weight_in_kg" real NOT NULL, 
            "available_quantity" real NOT NULL, 
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_a8b8dedc27f2d1078bc30212105" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."sensatta_stock_balance"`);
  }
}
