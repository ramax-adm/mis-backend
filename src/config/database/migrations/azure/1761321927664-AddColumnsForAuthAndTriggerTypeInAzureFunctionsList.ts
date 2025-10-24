import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnsForAuthAndTriggerTypeInAzureFunctionsList1761321927664 implements MigrationInterface {
  name = 'AddColumnsForAuthAndTriggerTypeInAzureFunctionsList1761321927664';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "azure"."azure_function_auth_level_enum" AS ENUM('anonymous', 'function', 'admin', 'system')`,
    );
    await queryRunner.query(
      `ALTER TABLE "azure"."azure_function_list" ADD "auth_level" "azure"."azure_function_auth_level_enum" NOT NULL DEFAULT 'function'`,
    );
    await queryRunner.query(
      `ALTER TABLE "azure"."azure_function_list" ADD "auth_key" character varying`,
    );
    await queryRunner.query(
      `CREATE TYPE "azure"."http_methods_enum" AS ENUM('GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "azure"."azure_function_list" ADD "http_method" "azure"."http_methods_enum" NOT NULL DEFAULT 'POST'`,
    );
    await queryRunner.query(
      `CREATE TYPE "azure"."azure_function_trigger_type_enum" AS ENUM('httpTrigger', 'timerTrigger', 'blobTrigger', 'queueTrigger', 'serviceBusTrigger', 'eventHubTrigger', 'eventGridTrigger', 'cosmosDBTrigger', 'signalRTrigger', 'iothubTrigger', 'rabbitMQTrigger', 'kafkaTrigger', 'activityTrigger', 'orchestrationTrigger', 'entityTrigger', 'customTrigger')`,
    );
    await queryRunner.query(
      `ALTER TABLE "azure"."azure_function_list" ADD "trigger_type" "azure"."azure_function_trigger_type_enum" NOT NULL DEFAULT 'httpTrigger'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "azure"."azure_function_list" ALTER COLUMN "created_by" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "azure"."azure_function_list" ALTER COLUMN "cron_expression" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "azure"."azure_function_list" ALTER COLUMN "description" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "azure"."azure_function_list" ALTER COLUMN "key" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "azure"."azure_function_list" DROP COLUMN "trigger_type"`,
    );
    await queryRunner.query(
      `DROP TYPE "azure"."azure_function_trigger_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "azure"."azure_function_list" DROP COLUMN "http_method"`,
    );
    await queryRunner.query(`DROP TYPE "azure"."http_methods_enum"`);
    await queryRunner.query(
      `ALTER TABLE "azure"."azure_function_list" DROP COLUMN "auth_key"`,
    );
    await queryRunner.query(
      `ALTER TABLE "azure"."azure_function_list" DROP COLUMN "auth_level"`,
    );
    await queryRunner.query(
      `DROP TYPE "azure"."azure_function_auth_level_enum"`,
    );
  }
}
