import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTempEntidadeGeolocalizacao1760274834542 implements MigrationInterface {
  name = 'CreateTempEntidadeGeolocalizacao1760274834542';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "dev"."temp_entidade_geolocalizacao" 
            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "ID_ENTIDADE" character varying, 
            "CODIGO_ENTIDADE" character varying, 
            "RAZAO_SOCIAL" character varying, 
            "NOME_FANTASIA" character varying, 
            "ENTIDADES_RELACIONADAS" character varying, 
            "ENTIDADE_ENDERECO" character varying,
            "ENTIDADE_CIDADE" character varying, 
            "ENTIDADE_UF" character varying,
            "ENTIDADE_CEP" character varying, 
            "GOOGLE_MAPS_ENDERECO" character varying, 
            "GOOGLE_MAPS_CIDADE" character varying, 
            "GOOGLE_MAPS_UF" character varying, 
            "GOOGLE_MAPS_CEP" character varying, 
            "GOOGLE_MAPS_LATITUDE" character varying, 
            "GOOGLE_MAPS_LONGITUDE" character varying, 
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_4808d38b2a42dec342405af9d97" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev"."temp_entidade_geolocalizacao"`);
  }
}
