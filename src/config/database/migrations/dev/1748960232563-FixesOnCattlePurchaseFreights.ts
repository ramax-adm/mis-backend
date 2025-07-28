import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixesOnCattlePurchaseFreights1748960232563
  implements MigrationInterface
{
  name = 'FixesOnCattlePurchaseFreights1748960232563';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchase_freights" DROP COLUMN "nf_cattle_quantity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchase_freights" DROP COLUMN "nf_freight_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchase_freights" ADD "freight_transport_type" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchase_freights" ADD "freight_transport_plate" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchase_freights" DROP COLUMN "freight_transport_plate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchase_freights" DROP COLUMN "freight_transport_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchase_freights" ADD "nf_freight_price" real`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchase_freights" ADD "nf_cattle_quantity" integer`,
    );
  }
}
