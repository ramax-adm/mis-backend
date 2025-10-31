import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSensattaAccountPayableAndReceivableTables1761839138660
  implements MigrationInterface
{
  name = ' CreateSensattaAccountPayableAndReceivableTables1761839138660';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "dev"."sensatta_accounts_payable" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),
             "base_date" date,
             "sensatta_id" character varying,
             "key" character varying,
             "company_code" character varying,
             "payment_number" character varying,
             "issue_date" date,
             "due_date" date,
             "liquidation_date" date,
             "status" character varying,
             "supply_code" character varying,
             "supply_name" character varying,
             "recognition_type_code" character varying,
             "recognition_type" character varying,
             "accounting_account" character varying,
             "accounting_classification" character varying,
             "accounting_account_name" character varying,
             "client_code" character varying,
             "client_name" character varying,
             "sales_representative_code" character varying,
             "sales_representative_name" character varying,
             "nf_id" character varying,
             "nf_number" character varying,
             "cfop_code" character varying,
             "cfop_description" character varying,
             "currency" character varying,
             "value" real,
             "payed_value" real,
             "additional_value" real,
             "sensatta_created_by" character varying,
             "sensatta_viewed_by" character varying,
             "sensatta_approved_by" character varying,
             "sensatta_liquidated_by" character varying,
             "observation" character varying,
             "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
             CONSTRAINT "PK_7f594f9d6b3ef3f11b09db7e3c2" PRIMARY KEY ("id"))`);
    await queryRunner.query(`
            CREATE TABLE "dev"."sensatta_accounts_receivable" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),
             "base_date" date,
             "sensatta_id" character varying,
             "key" character varying,
             "company_code" character varying,
             "receivable_number" character varying,
             "issue_date" date,
             "due_date" date,
             "recognition_date" date,
             "loss_recognition_date" date,
             "status" character varying,
             "client_code" character varying,
             "client_name" character varying,
             "sales_representative_code" character varying,
             "sales_representative_name" character varying,
             "nf_id" character varying,
             "nf_number" character varying,
             "cfop_code" character varying,
             "cfop_description" character varying,
             "accounting_account" character varying,
             "accounting_classification" character varying,
             "accounting_account_name" character varying,
             "person_type" character varying,
             "currency" character varying,
             "value" real,
             "open_value" real,
             "sensatta_created_by" character varying,
             "sensatta_approved_by" character varying,
             "observation" text,
             "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
              CONSTRAINT "PK_33de52b54b67627215197d887d3" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."sensatta_accounts_receivable"`);
    await queryRunner.query(`DROP TABLE "dev"."sensatta_accounts_payable"`);
  }
}
