import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSensattaTables1744627988943 implements MigrationInterface {
  name = ' CreateSensattaTables1744627988943';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "dev"."sensatta_reference_prices" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "sensatta_id" character varying NOT NULL, 
            "product_id" character varying NOT NULL, 
            "main_price_table_id" character varying NOT NULL, 
            "company_code" character varying NOT NULL, 
            "main_table_number" integer NOT NULL, 
            "main_description" character varying NOT NULL, 
            "price" real NOT NULL, 
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "PK_7440b2707eefcb37dd1861072cd" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "dev"."sensatta_products" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "sensatta_id" character varying NOT NULL, 
            "sensatta_code" character varying NOT NULL, 
            "name" character varying NOT NULL, 
            "product_line_code" character varying NOT NULL, 
            "unit_code" character varying NOT NULL, 
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_102792477dd01986c8de3b1f016" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "dev"."sensatta_product_lines" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "sensatta_id" character varying NOT NULL, 
            "sensatta_code" character varying NOT NULL, 
            "name" character varying NOT NULL, 
            "acronym" character varying NOT NULL, 
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_88173e43f357a38dda9d3822dd6" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "dev"."sensatta_companies" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "sensatta_id" character varying NOT NULL, 
            "sensatta_code" character varying NOT NULL, 
            "city" character varying NOT NULL, 
            "uf" character varying NOT NULL, 
            "name" character varying NOT NULL, 
            "fantasy_name" character varying NOT NULL, 
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_59ad9a41a1f29cd18c55af00eb5" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "dev"."sensatta_warehouses" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "sensatta_code" character varying NOT NULL, 
            "company_code" character varying NOT NULL, 
            "name" character varying NOT NULL, 
            "is_active" boolean NOT NULL, 
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_56ae21ee2432b2270b48867e4be" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."sensatta_companies"`);
    await queryRunner.query(`DROP TABLE "dev"."sensatta_product_lines"`);
    await queryRunner.query(`DROP TABLE "dev"."sensatta_products"`);
    await queryRunner.query(`DROP TABLE "dev"."sensatta_reference_prices"`);
    await queryRunner.query(`DROP TABLE "dev"."sensatta_warehouses"`);
  }
}
