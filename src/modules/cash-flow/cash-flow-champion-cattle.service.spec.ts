import { Test } from '@nestjs/testing';
import { CommonDto } from './dtos/common/common.dto';
import { NumberUtils } from '../utils/services/number.utils';
import { beforeEach, describe, expect, it } from 'vitest';
import { CashFlowChampionCattleService } from './cash-flow-champion-cattle.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CashFlowProduct } from './entities/cash-flow-product.entity';
import { MakeCashFlowProduct } from './factories/make-cash-flow-product';
import { CashFlowService } from './cash-flow.service';
import { CommonChampionCattleDto } from './dtos/common/champion-cattle/common.dto';

describe('CashFlowChampionCattleService', () => {
  let service: CashFlowChampionCattleService;
  let cashFlowService = {};
  let cashFlowProductRepository = {};

  const dto: CommonChampionCattleDto = {
    projecao: {
      diasProjecao: 90,
    },
    matPrima: {
      cbs: 300,
      diasPagamento: 2,
      diasPagamentoFrete: 15,
      pDt: 40 / 100,
      pPa: 13 / 100,
      pTr: 47 / 100,
      pesoArroba: 17,
      precoArroba: 305,
      precoFreteKg: 0.3,
    },
    operacao: {
      arredKg: 0,
      precoEmbalagem: 0.45,
      precoMod: 0.4,
      tipoArrend: '',
      diasPagamentoProdutos: 24,
    },
    mi: {
      pComissoesMi: 0.7 / 100,
      pImpostosMi: 1.8 / 100,
      precoFreteMi: 1.25,
      vendasMiDias: 21,
    },
    me: {
      vendasMeDias: 10,
      pAntecipacaoMe: 40 / 100,
      diasPosicao: 30,
      ptax: 5.7,
      precoFreteRodoviario: 0.75,
      precoPorto: 0.25,
      precoFreteInter: 0.45,
      precoFinanc: 0.4,
    },
    rendimentosMe: {
      dt: {
        pAcem: 0.38,
        pPeito: 0.089,
        pGorduraExt: 0.01,
        pGorduraInt: 0.002,
        pMusculo: 0.064,
        pPaleta: 0.201,
      },
      pa: { pCostela: 0.705 },
      tr: {
        pBananinha: 0.0075,
        pLagarto: 0.031,
        pContraFile: 0.085,
        pMusculoMole: 0.033,
        pCoxaoDuro: 0.061,
        pMusculoDuro: 0.032,
        pCoxaoMole: 0.111,
        pPatinho: 0.079,
        pFileMignon: 0.031,
        pRecortes: 0.024,
        pFileCostela: 0.04,
        pRoubado: 0.063,
        pCorAlcatra: 0.068,
        pMaminha: 0.0185,
        pPicanha: 0.022,
        pFralda: 0.028,
      },
    },
    rendimentosMi: {
      dt: {
        pAcem: NumberUtils.nb4(33.3 / 100), // 33.3% representado como 33.3 / 100
        pCupim: NumberUtils.nb4(3.35 / 100), // 3.35% representado como 3.35 / 100
        pMusculo: NumberUtils.nb4(6.8 / 100), // 6.8% representado como 6.8 / 100
        pPaleta: NumberUtils.nb4(22 / 100), // 22% representado como 22 / 100
        pPeito: NumberUtils.nb4(9.7 / 100), // 9.7% representado como 9.7 / 100
        pRecortes: NumberUtils.nb4(0.1 / 100), // 0.1% representado como 0.1 / 100
      },
      pa: {
        pBifeVazio: NumberUtils.nb4(2.9 / 100), // 2.9% representado como 2.9 / 100
        pCostela: NumberUtils.nb4(95 / 100), // 95% representado como 95 / 100
      },
      tr: {
        pBananinha: NumberUtils.nb4(0.6 / 100), // 0.6% representado como 0.6 / 100
        pCapaFile: NumberUtils.nb4(2.85 / 100), // 2.85% representado como 2.85 / 100
        pContraFile: NumberUtils.nb4(12.65 / 100), // 12.65% representado como 12.65 / 100
        pCorAlcatra: NumberUtils.nb4(6.8 / 100), // 6.8% representado como 6.8 / 100
        pCoxaoDuro: NumberUtils.nb4(8 / 100), // 8% representado como 8 / 100
        pCoxaoMole: NumberUtils.nb4(14.35 / 100), // 14.35% representado como 14.35 / 100
        pFileMignon: NumberUtils.nb4(3.2 / 100), // 3.2% representado como 3.2 / 100
        pFralda: NumberUtils.nb4(2.8 / 100), // 2.8% representado como 2.8 / 100
        pGordura: NumberUtils.nb4(1 / 100), // 1% representado como 1 / 100
        pLagarto: NumberUtils.nb4(3.75 / 100), // 3.75% representado como 3.75 / 100
        pMaminha: NumberUtils.nb4(1.85 / 100), // 1.85% representado como 1.85 / 100
        pMusculo: NumberUtils.nb4(6.55 / 100), // 6.55% representado como 6.55 / 100
        pPatinho: NumberUtils.nb4(7.9 / 100), // 7.9% representado como 7.9 / 100
        pPicanha: NumberUtils.nb4(2.2 / 100), // 2.2% representado como 2.2 / 100
        pRecAlcatra: NumberUtils.nb4(0.5 / 100), // 0.5% representado como 0.5 / 100
        pRecortes: NumberUtils.nb4(1.9 / 100), // 1.9% representado como 1.9 / 100
      },
    },

    precosMe: {
      dt: {
        pAcem: 5,
        pGorduraExt: 2.4,
        pGorduraInt: 7.6,
        pMusculo: 5,
        pPaleta: 5,
        pPeito: 5,
      },
      pa: { pCostela: 4 },
      tr: {
        pBananinha: 6.5,
        pContraFile: 6.2,
        pCoxaoDuro: 5.7,
        pCoxaoMole: 5.7,
        pFileMignon: 10.2,
        pFileCostela: 6.2,
        pCorAlcatra: 6.2,
        pPicanha: 8.5,
        pLagarto: 5.7,
        pMusculoMole: 5.7,
        pMusculoDuro: 5.7,
        pPatinho: 5.7,
        pRecortes: 3.3,
        pRoubado: 4.2,
        pMaminha: 6.2,
        pFralda: 6.2,
      },
    },
    precosMi: {
      dt: {
        pAcem: 22.3,
        pCupim: 29.6,
        pMusculo: 19.4,
        pPaleta: 24.9,
        pPeito: 24.4,
        pRecortes: 12,
      },
      pa: { pBifeVazio: 28.2, pCostela: 16.2 },
      tr: {
        pBananinha: 30,
        pCapaFile: 27,
        pContraFile: 38,
        pCorAlcatra: 37.1,
        pCoxaoDuro: 27.3,
        pCoxaoMole: 29.3,
        pFileMignon: 58.6,
        pFralda: 27.9,
        pLagarto: 27.3,
        pMaminha: 30,
        pMusculo: 18.8,
        pPatinho: 30.5,
        pPicanha: 60,
        pRecAlcatra: 18,
        pRecortes: 17.7,
        pGordura: 7,
      },
    },
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CashFlowChampionCattleService,
        {
          provide: CashFlowService,
          useValue: cashFlowService,
        },
        {
          provide: getRepositoryToken(CashFlowProduct),
          useValue: cashFlowProductRepository,
        },
      ],
    }).compile();

    service = module.get<CashFlowChampionCattleService>(
      CashFlowChampionCattleService,
    );
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProductPercent', () => {
    it('should be able to get the percent of product representation', async () => {
      const product = MakeCashFlowProduct.create({
        id: '1',
        name: 'Acem',
        market: 'both',
        incomeKey: 'pAcem',
        quarterKey: 'dt',
      });
      const sut = service.getProductPercent(product, dto);

      expect(sut).toBeDefined();
      expect(sut).toEqual({
        mePercent: 0.152,
        miPercent: 0.1332,
        incomeMe: 0.38,
        incomeMi: 0.333,
      });
    });
  });
});
