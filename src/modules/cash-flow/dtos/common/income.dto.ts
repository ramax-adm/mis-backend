import { NumberUtils } from '@/modules/utils/services/number.utils';
import { Expose, Type, Transform } from 'class-transformer';
import { MeIncomeControlsDto } from '../controls/me-income-controls.dto';
import { MePricesControlsDto } from '../controls/me-prices-controls.dto';
import { MiIncomeControlsDto } from '../controls/mi-income-controls.dto';
import { MiPricesControlsDto } from '../controls/mi-prices-controls.dto';
import { RawMaterialControlsDto } from '../controls/raw-material-controls.dto';

export class GetMeIncomes {
  matPrima: RawMaterialControlsDto;
  rendimentos: MeIncomeControlsDto;
  precos: MePricesControlsDto;
  ptax: number;
}

export class GetMiIncomes {
  matPrima: RawMaterialControlsDto;
  rendimentos: MiIncomeControlsDto;
  precos: MiPricesControlsDto;
}

export class MeDtIncomeControlsDto {
  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pAcem: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pPeito: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pGorduraExt: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pGorduraInt: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pMusculo: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pPaleta: number;
}

export class MePaIncomeControlsDto {
  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pCostela: number;
}

export class MeTrIncomeControlsDto {
  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pBananinha: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pLagarto: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pContraFile: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pMusculoMole: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pCoxaoDuro: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pMusculoDuro: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pCoxaoMole: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pPatinho: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pFileMignon: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pRecortes: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pFileCostela: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pRoubado: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pCorAlcatra: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pMaminha: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pPicanha: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pFralda: number;
}

export class MiDtIncomeControlsDto {
  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pAcem: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pPaleta: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pCupim: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pPeito: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pMusculo: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pRecortes: number;
}

export class MiPaIncomeControlsDto {
  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pCostela: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pBifeVazio: number;
}

export class MiTrIncomeControlsDto {
  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pBananinha: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pLagarto: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pCapaFile: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pMaminha: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pContraFile: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pMusculo: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pCorAlcatra: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pPatinho: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pCoxaoDuro: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pPicanha: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pCoxaoMole: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pRecAlcatra: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pFileMignon: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pRecortes: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pFralda: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => NumberUtils.nb4(value / 100))
  pGordura: number;
}
