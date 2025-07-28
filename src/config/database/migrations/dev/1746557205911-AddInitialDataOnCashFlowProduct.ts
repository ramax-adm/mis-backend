import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInitialDataOnCashFlowProduct1746557205911
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO "dev"."cash_flow_products" (name, income_key, quarter_key, market) VALUES
            ('Gordura Ext.', 'pGorduraExt', 'dt', 'external'),
            ('Gordura Int.', 'pGorduraInt', 'dt', 'external'),
            ('Musculo Mole', 'pMusculoMole', 'tr', 'external'),
            ('Musculo Duro', 'pMusculoDuro', 'tr', 'external'),
            ('Roubado', 'pRoubado', 'tr', 'external'),
            ('Filé Costela', 'pFileCostela', 'tr', 'external');`);

    await queryRunner.query(`
            INSERT INTO "dev"."cash_flow_products" (name, income_key, quarter_key, market) VALUES
            ('Cupim', 'pCupim', 'dt', 'internal'),
            ('Bife Vazio', 'pBifeVazio', 'pa', 'internal'),
            ('Capa Filé', 'pCapaFile', 'tr', 'internal'),
            ('Rec. Alcatra', 'pRecAlcatra', 'tr', 'internal'),
            ('Gordura', 'pGordura', 'tr', 'internal');`);

    await queryRunner.query(`
            INSERT INTO "dev"."cash_flow_products" (name, income_key, quarter_key, market) VALUES
            ('Acém', 'pAcem', 'dt', 'both'),
            ('Peito', 'pPeito', 'dt', 'both'),
            ('Músculo', 'pMusculo', 'dt', 'both'),
            ('Paleta', 'pPaleta', 'dt', 'both'),
            ('Costela', 'pCostela', 'pa', 'both'),
            ('Bananinha', 'pBananinha', 'tr', 'both'),
            ('Lagarto', 'pLagarto', 'tr', 'both'),
            ('Contra Filé', 'pContraFile', 'tr', 'both'),
            ('Coxão Duro', 'pCoxaoDuro', 'tr', 'both'),
            ('Coxão Mole', 'pCoxaoMole', 'tr', 'both'),
            ('Patinho', 'pPatinho', 'tr', 'both'),
            ('Filé Mignon', 'pFileMignon', 'tr', 'both'),
            ('Recortes', 'pRecortes', 'tr', 'both'),
            ('Cor. Alcatra', 'pCorAlcatra', 'tr', 'both'),
            ('Maminha', 'pMaminha', 'tr', 'both'),
            ('Picanha', 'pPicanha', 'tr', 'both'),
            ('Fralda', 'pFralda', 'tr', 'both');`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "dev"."cash_flow_products"
      WHERE income_key IN (
        'pGorduraExt',
        'pGorduraInt',
        'pMusculoMole',
        'pMusculoDuro',
        'pRoubado',
        'pFileCostela',
        'pCupim',
        'pBifeVazio',
        'pCapaFile',
        'pRecAlcatra',
        'pGordura',
        'pAcem',
        'pPeito',
        'pMusculo',
        'pPaleta',
        'pCostela',
        'pBananinha',
        'pLagarto',
        'pContraFile',
        'pCoxaoDuro',
        'pCoxaoMole',
        'pPatinho',
        'pFileMignon',
        'pRecortes',
        'pCorAlcatra',
        'pMaminha',
        'pPicanha',
        'pFralda'
      );
    `);
  }
}
