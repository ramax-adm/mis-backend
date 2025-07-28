import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSensattaProductionMovementsTable1752163021385
  implements MigrationInterface
{
  name = 'CreateSensattaProductionMovementsTable1752163021385';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dev"."sensatta_production_movements" 
      ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),
       "date" date, 
       "company_code" character varying, 
       "movement_type" character varying,
       "operation_type" character varying,
       "purchase_cattle_order_id" character varying, 
       "product_code" character varying, 
       "product_name" character varying, 
       "product_quarter" character varying, 
       "weight_in_kg" real, 
       "quantity" integer, "boxQuantity" integer, 
       "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
       CONSTRAINT "PK_389f261818230385e880d94b2b4" PRIMARY KEY ("id")); 
       COMMENT ON COLUMN "dev"."sensatta_production_movements"."company_code" IS 'codigo empresa'; 
       COMMENT ON COLUMN "dev"."sensatta_production_movements"."movement_type" IS 'movimentação (entrada e saida)'; 
       COMMENT ON COLUMN "dev"."sensatta_production_movements"."operation_type" IS 'especie de movimentação (reprocesso, padrao e etc)'; 
       COMMENT ON COLUMN "dev"."sensatta_production_movements"."purchase_cattle_order_id" IS 'ordem compra'; 
       COMMENT ON COLUMN "dev"."sensatta_production_movements"."product_code" IS 'codigo produto'; 
       COMMENT ON COLUMN "dev"."sensatta_production_movements"."product_name" IS 'descricao produto'; 
       COMMENT ON COLUMN "dev"."sensatta_production_movements"."product_quarter" IS 'quarteio'; 
       COMMENT ON COLUMN "dev"."sensatta_production_movements"."weight_in_kg" IS 'peso kg'; 
       COMMENT ON COLUMN "dev"."sensatta_production_movements"."quantity" IS 'pecas'; 
       COMMENT ON COLUMN "dev"."sensatta_production_movements"."boxQuantity" IS 'quatidade caixas'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."sensatta_production_movements"`);
  }
}
