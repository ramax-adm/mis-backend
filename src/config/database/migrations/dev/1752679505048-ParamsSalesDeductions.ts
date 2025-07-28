import { MigrationInterface, QueryRunner } from 'typeorm';

export class ParamsSalesDeductions1752679505048 implements MigrationInterface {
  name = 'ParamsSalesDeductions1752679505048';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "dev"."params_sales_deductions" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "name" character varying NOT NULL, 
            "value" integer NOT NULL, 
            "market" character varying NOT NULL, 
            "companyCode" character varying NOT NULL, 
            "unit" character varying NOT NULL, 
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), 
            "deleted_at" TIMESTAMP WITH TIME ZONE, 
            "created_by" uuid NOT NULL, 
            "updated_by" uuid, 
            "deleted_by" uuid, CONSTRAINT "PK_ef879201042644827926ab26d67" PRIMARY KEY ("id"))`);
    await queryRunner.query(
      `CREATE TABLE "dev"."params_sales_deduction_product_lines" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_line_id" uuid NOT NULL, "param_sale_deduction_id" uuid NOT NULL, CONSTRAINT "PK_efd8562c8e64a0a6468e535fb8e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."params_sales_deductions" ADD CONSTRAINT "FK_f7d96170184621469147db41d29" FOREIGN KEY ("created_by") REFERENCES "dev"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."params_sales_deductions" ADD CONSTRAINT "FK_ea02623446fa1525631ed5161ab" FOREIGN KEY ("updated_by") REFERENCES "dev"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."params_sales_deductions" ADD CONSTRAINT "FK_1b9b3f6cafb43cfaa3ab1ae4088" FOREIGN KEY ("deleted_by") REFERENCES "dev"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."params_sales_deduction_product_lines" ADD CONSTRAINT "FK_37dc11359c416239a965d1b7cfd" FOREIGN KEY ("product_line_id") REFERENCES "dev"."sensatta_product_lines"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."params_sales_deduction_product_lines" ADD CONSTRAINT "FK_7d0fb0519614646d14523c33cb4" FOREIGN KEY ("param_sale_deduction_id") REFERENCES "dev"."params_sales_deductions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."params_sales_deduction_product_lines" DROP CONSTRAINT "FK_7d0fb0519614646d14523c33cb4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."params_sales_deduction_product_lines" DROP CONSTRAINT "FK_37dc11359c416239a965d1b7cfd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."params_sales_deductions" DROP CONSTRAINT "FK_1b9b3f6cafb43cfaa3ab1ae4088"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."params_sales_deductions" DROP CONSTRAINT "FK_ea02623446fa1525631ed5161ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."params_sales_deductions" DROP CONSTRAINT "FK_f7d96170184621469147db41d29"`,
    );
    await queryRunner.query(
      `DROP TABLE "dev"."params_sales_deduction_product_lines"`,
    );
    await queryRunner.query(`DROP TABLE "dev"."params_sales_deductions"`);
  }
}
