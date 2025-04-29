import { NumberUtils } from '@/services/utils/number.utils';
import { Expose, Transform, Type } from 'class-transformer';

export class MiPricesControlsDto {
  dt: {
    pAcem: number;
    pPaleta: number;
    pCupim: number;
    pPeito: number;
    pMusculo: number;
    pRecortes: number;
  };
  pa: {
    pCostela: number;
    pBifeVazio: number;
  };
  tr: {
    pBananinha: number;
    pLagarto: number;
    pCapaFile: number;
    pMaminha: number;
    pContraFile: number;
    pMusculo: number;
    pCorAlcatra: number;
    pPatinho: number;
    pCoxaoDuro: number;
    pPicanha: number;
    pCoxaoMole: number;
    pRecAlcatra: number;
    pFileMignon: number;
    pRecortes: number;
    pFralda: number;
    pGordura: number;
  };
}
