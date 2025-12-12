import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInvoiceIndexes1765571738548 implements MigrationInterface {
  name = 'CreateInvoiceIndexes1765571738548';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_sensatta_invoices_nf_id_product_code
      ON dev.sensatta_invoices (nf_id, product_code);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_sensatta_invoices_nf_number_product_code
      ON dev.sensatta_invoices (nf_number, product_code);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS dev.idx_sensatta_invoices_nf_id_product_code;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS dev.idx_sensatta_invoices_nf_number_product_code;
    `);
  }
}
