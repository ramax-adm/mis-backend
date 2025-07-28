import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExternalHumanResourcesHours1749582661333
  implements MigrationInterface
{
  name = 'ExternalHumanResourcesHours1749582661333';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "dev"."external_human_resources_hours" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "date" date NOT NULL, 
            "integration_system" character varying NOT NULL, 
            "companyCode" character varying NOT NULL, 
            "payroll_number" character varying NOT NULL, 
            "employee_name" character varying NOT NULL, 
            "department" character varying NOT NULL, 
            "normal_hours" character varying NOT NULL, 
            "hours_off" character varying NOT NULL, 
            "absence_hours" character varying NOT NULL, 
            "half_extra_hours" character varying NOT NULL,
            "full_extra_hours" character varying NOT NULL, 
            "absence_justification" character varying NOT NULL, 
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_a8221b7c0a59c90cf4cfe3045ea" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE "dev"."external_human_resources_hours"`,
    );
  }
}
