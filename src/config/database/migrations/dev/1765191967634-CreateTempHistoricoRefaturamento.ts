import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTempHistoricoRefaturamento1765191967634
  implements MigrationInterface
{
  name = 'CreateTempHistoricoRefaturamento1765191967634';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "dev"."temp_historico_refaturamento" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4()
            , "PEDIDO_FATURAMENTO" character varying
            , "NF_FATURAMENTO" character varying
            , "BO" character varying
            , "NF_DEVOLUCAO" character varying
            , "SEQUENCIA_REFATURAMENTO" character varying
            , "PEDIDO_REFATURAMENTO" character varying
            , "NF_REFATURAMENTO" character varying
            , "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            , CONSTRAINT "PK_3894b3602c5afd26fcb459e3bb1" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."temp_historico_refaturamento"`);
  }
}
