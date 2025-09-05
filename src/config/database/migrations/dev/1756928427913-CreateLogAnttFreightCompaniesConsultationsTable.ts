import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLogAnttFreightCompaniesConsultationsTable1756928427913
  implements MigrationInterface
{
  name = 'CreateLogAnttFreightCompaniesConsultationsTable1756928427913';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dev"."log_antt_freight_companies_consultations" 
      ("id" SERIAL NOT NULL, 
      "log_type" character varying NOT NULL, 
      "request_uri" character varying NOT NULL, 
      "request_payload" jsonb, 
      "response" jsonb, 
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
       CONSTRAINT "PK_1e0213d21306efd9b47c8de0343" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE "dev"."log_antt_freight_companies_consultations"`,
    );
  }
}
