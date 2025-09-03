import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingPriceInformationInFreightsTable1756836128128
  implements MigrationInterface
{
  name = 'AddMissingPriceInformationInFreightsTable1756836128128';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchase_freights" ADD "receipt_date" date`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchase_freights" ADD "freight_transport_capacity" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchase_freights" ADD "toll_price" real`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchase_freights" ADD "road_price" real`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchase_freights" ADD "earth_price" real`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchase_freights" ADD "outing_price" real`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchase_freights" ADD "additional_price" real`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchase_freights" ADD "discount_price" real`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchase_freights" DROP COLUMN "discount_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchase_freights" DROP COLUMN "additional_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchase_freights" DROP COLUMN "outing_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchase_freights" DROP COLUMN "earth_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchase_freights" DROP COLUMN "road_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchase_freights" DROP COLUMN "toll_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchase_freights" DROP COLUMN "freight_transport_capacity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."sensatta_cattle_purchase_freights" DROP COLUMN "receipt_date"`,
    );
  }
}
