import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSimulationTypeEnum1746554858239 implements MigrationInterface {
  name = 'AddSimulationTypeEnum1746554858239';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "dev"."simulation_type_enum" AS ENUM('normal', 'champion-cattle')`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."cash_flow_simulations" ADD "type" "dev"."simulation_type_enum" NOT NULL DEFAULT 'normal'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."cash_flow_simulations" DROP COLUMN "type"`,
    );
    await queryRunner.query(`DROP TYPE "dev"."simulation_type_enum"`);
  }
}
