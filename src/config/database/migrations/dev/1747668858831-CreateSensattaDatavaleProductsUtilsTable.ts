import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSensattaDatavaleProductsUtilsTable1747668858831
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS dev.utils_sensatta_datavale_products (
            id uuid DEFAULT uuid_generate_v4() NOT NULL,
            datavale_code varchar NOT NULL,
            sensatta_code varchar NOT NULL,
            datavale_name varchar NOT NULL,
            created_at timestamptz DEFAULT now() NOT NULL,
            CONSTRAINT "PK_utils_sensatta_datavale_products_id" PRIMARY KEY (id));`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE dev.utils_sensatta_datavale_products;`);
  }
}
