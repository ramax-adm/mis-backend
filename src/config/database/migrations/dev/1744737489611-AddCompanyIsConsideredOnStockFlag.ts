import { MigrationInterface, QueryRunner } from "typeorm";

export class  AddCompanyIsConsideredOnStockFlag1744737489611 implements MigrationInterface {
    name = ' AddCompanyIsConsideredOnStockFlag1744737489611'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dev"."sensatta_companies" ADD "is_considered_on_stock" boolean NOT NULL DEFAULT 'false'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dev"."sensatta_companies" DROP COLUMN "is_considered_on_stock"`);
    }

}
