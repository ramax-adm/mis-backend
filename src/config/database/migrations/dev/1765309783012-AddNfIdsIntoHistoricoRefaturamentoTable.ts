import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNfIdsIntoHistoricoRefaturamentoTable1765309783012
  implements MigrationInterface
{
  name = 'AddNfIdsIntoHistoricoRefaturamentoTable1765309783012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."temp_historico_refaturamento" ADD "CODIGO_EMPRESA" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."temp_historico_refaturamento" ADD "ID_NF_FATURAMENTO" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."temp_historico_refaturamento" ADD "ID_NF_REFATURAMENTO" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."temp_historico_refaturamento" DROP COLUMN "ID_NF_REFATURAMENTO"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."temp_historico_refaturamento" DROP COLUMN "ID_NF_FATURAMENTO"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."temp_historico_refaturamento" DROP COLUMN "CODIGO_EMPRESA"`,
    );
  }
}
