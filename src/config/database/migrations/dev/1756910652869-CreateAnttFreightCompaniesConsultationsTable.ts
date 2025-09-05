import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnttFreightCompaniesConsultationsTable1756910652869
  implements MigrationInterface
{
  name = 'CreateAnttFreightCompaniesConsultationsTable1756910652869';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dev"."antt_freight_companies_consultations" 
      ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
      "date" date NOT NULL, 
      "sensatta_code" character varying(50), 
      "freight_company" character varying(255), 
      "rnrtc_code" character varying(50), 
      "rnrtc_status" character varying(50), 
      "location" character varying(255), 
      "result_status" character varying(50), 
      "result_description" text, 
      "result_observation" text, 
      "registered_at" date, 
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
      CONSTRAINT "PK_34c8d9336afe365e5a7f730bde0" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE "dev"."antt_freight_companies_consultations"`,
    );
  }
}
