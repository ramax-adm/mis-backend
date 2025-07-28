import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCashFlowSimulationsTable1743630533054
  implements MigrationInterface
{
  name = ' AddCashFlowSimulationsTable1743630533054';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dev"."cash_flow_simulations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "public_id" SERIAL NOT NULL, "request_dto" json NOT NULL, "results" json NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid NOT NULL, "updated_by" uuid, "deleted_by" uuid, CONSTRAINT "PK_38fb00f86a624d9068ae4a803bc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."cash_flow_simulations" ADD CONSTRAINT "FK_da4d6bd0b6121dbe54269aeae1a" FOREIGN KEY ("created_by") REFERENCES "dev"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."cash_flow_simulations" ADD CONSTRAINT "FK_ff2c22cf5ee0194183a38f89ddf" FOREIGN KEY ("updated_by") REFERENCES "dev"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."cash_flow_simulations" ADD CONSTRAINT "FK_ef8bd58599875682a5d4b59c88f" FOREIGN KEY ("deleted_by") REFERENCES "dev"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."cash_flow_simulations" DROP CONSTRAINT "FK_ef8bd58599875682a5d4b59c88f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."cash_flow_simulations" DROP CONSTRAINT "FK_ff2c22cf5ee0194183a38f89ddf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."cash_flow_simulations" DROP CONSTRAINT "FK_da4d6bd0b6121dbe54269aeae1a"`,
    );
    await queryRunner.query(`DROP TABLE "dev"."cash_flow_simulations"`);
  }
}
