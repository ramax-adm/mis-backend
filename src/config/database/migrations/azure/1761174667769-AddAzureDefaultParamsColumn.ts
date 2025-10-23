import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAzureDefaultParamsColumn1761174667769
  implements MigrationInterface
{
  name = 'AddAzureDefaultParamsColumn1761174667769';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "azure"."azure_function_list" ADD "default_params" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "azure"."azure_function_list" DROP COLUMN "default_params"`,
    );
  }
}
