import { Test } from '@nestjs/testing';
import { ProjectProductionResponseDto } from '../dtos/project-production-response.dto';
import { ProjectEntriesResponseDto } from '../dtos/project-entries-response.dto';
import { CommonDto } from '../dtos/common/common.dto';
import { ProjectOutingsResponseDto } from '../dtos/project-outings-response.dto';
import { NumberUtils } from '../../utils/services/number.utils';
import { ProjectOperationClosureResponseDto } from '../dtos/project-operation-closure-response.dto';
import { GetProductionValuesResponseDto } from '../dtos/get-production-values-response.dto';
import { ProjectCostByKgResponseDto } from '../dtos/project-cost-by-kg-response.dto';
import { beforeEach, describe, expect, it } from 'vitest';
import { CashFlowService } from './cash-flow.service';

describe('CashFlowService', () => {
  let service: CashFlowService;
  const dto: CommonDto = {
    projecao: {
      diasProjecao: 90,
    },
    matPrima: {
      cbsMe: 300,
      cbsMi: 100,
      diasPagamento: 2,
      diasPagamentoFrete: 15,
      pDt: 40 / 100,
      pPa: 13 / 100,
      pTr: 47 / 100,
      pesoArroba: 17,
      precoArrobaMe: 305,
      precoArrobaMi: 295,
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
      providers: [CashFlowService],
    }).compile();

    service = module.get<CashFlowService>(CashFlowService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Get Total Projection Days', () => {
    it('should be able to get total projection days', () => {
      const result1 = service.getTotalProjectionDays({
        diasPagamento: 2,
        diasPagamentoFrete: 5,
        diasPagamentoProdutos: 30,
        diasProjecao: 10,
        vendasMeDias: 5,
        vendasMiDias: 5,
      });

      expect(result1).toBeDefined();
      expect(result1).toEqual(30);

      const result2 = service.getTotalProjectionDays({
        diasPagamento: 2,
        diasPagamentoFrete: 10,
        diasPagamentoProdutos: 30,
        diasProjecao: 90,
        vendasMeDias: 5,
        vendasMiDias: 7,
      });

      expect(result2).toBeDefined();
      expect(result2).toEqual(120);

      const result3 = service.getTotalProjectionDays({
        diasPagamento: 4,
        diasPagamentoFrete: 11,
        diasPagamentoProdutos: 45,
        diasProjecao: 100,
        vendasMiDias: 7,
        vendasMeDias: 2,
      });

      expect(result3).toBeDefined();
      expect(result3).toEqual(135);
    });
  });

  describe('Incomes', () => {
    it('should be able to get total incomes for MI market', () => {
      const result = service.getMiTotalIncomes(dto.rendimentosMi);

      const expectedResult = {
        totalDtIncome: 0.7525,
        totalPaIncome: 0.979,
        totalTrIncome: 0.769,
      };

      expect(result).toBeDefined();
      expect(result).toEqual(expectedResult);
    });

    it('should be able to get total incomes for ME market', () => {
      const result = service.getMeTotalIncomes(dto.rendimentosMe);

      const expectedResult = {
        totalDtIncome: 0.746,
        totalPaIncome: 0.705,
        totalTrIncome: 0.734,
      };

      expect(result).toBeDefined();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('Get Entries', () => {
    it('should be able to get total entries in KG of MI market', () => {
      const dto = {
        cbs: 100,
        pesoArroba: 17,
        pDt: 0.4,
        pTr: 0.47,
        pPa: 0.13,
      };

      const result = service.getTotalEntries(dto);

      const expectedResult = {
        totalEntriesInKg: 25500,
        totalDtEntriesInKg: 10200,
        totalPaEntriesInKg: 3315,
        totalTrEntriesInKg: 11985,
      };
      expect(result).toBeDefined();
      expect(result).toEqual(expectedResult);
    });

    it('should be able to get total entries in KG of ME market', () => {
      const dto = {
        cbs: 300,
        pesoArroba: 17,
        pDt: 0.4,
        pTr: 0.47,
        pPa: 0.13,
      };

      const result = service.getTotalEntries(dto);

      const expectedResult = {
        totalEntriesInKg: 76500,
        totalDtEntriesInKg: 30600,
        totalPaEntriesInKg: 9945,
        totalTrEntriesInKg: 35955,
      };
      expect(result).toBeDefined();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('Production Values', () => {
    it('should be able to calculate production values', () => {
      const result = service.getProductionValues(dto);

      const expectedResult: GetProductionValuesResponseDto = {
        me: {
          dt: {
            entradaDt: 30600,
            kgRendimentoDt: 22827.6, // s/ arredondar
            pRendimentoDt: 0.746,
          },
          pa: {
            entradaPa: 9945,
            kgRendimentoPa: 7011.224999999999, // s/ arredondar
            pRendimentoPa: 0.705,
          },
          tr: {
            entradaTr: 35955,
            kgRendimentoTr: 26390.97, // s/ arredondar
            pRendimentoTr: 0.734,
          },
        },
        mi: {
          dt: {
            entradaDt: 10200,
            kgRendimentoDt: 7675.499999999999, // -1kg por conta de arredondamento
            pRendimentoDt: 0.7525,
          },
          pa: {
            entradaPa: 3315,
            kgRendimentoPa: 3245.3849999999998, // s/ arredondar
            pRendimentoPa: 0.979,
          },
          tr: {
            entradaTr: 11985,
            kgRendimentoTr: 9216.465, // s/ arredondar
            pRendimentoTr: 0.769,
          },
        },
        totalByQuartering: {
          dt: {
            entradaDt: 40800,
            kgProduzidoDt: 30503.1, // s/ arredondar
            pRendimentoDt: 0.7476,
          },
          pa: {
            entradaPa: 13260,
            kgProduzidoPa: 10256.609999999999, // -1kg por conta de arredondamento
            pRendimentoPa: 0.7735,
          },
          tr: {
            entradaTr: 47940,
            kgProduzidoTr: 35607.435, // s/ arredondar
            pRendimentoTr: 0.7427,
          }, // -0.01% por conta de arredondamento
        },
        total: {
          kgEntradaMi: 25500,
          kgProduzidoMi: 20137.35,
          pRendimentoMi: 0.7897,
          kgEntradaMe: 76500,
          kgProduzidoMe: 56229.795,
          pRendimentoMe: 0.735,
          kgEntrada: 102000,
          kgProduzido: 76367.14499999999, // -1kg por conta de arredondamento
          pRendimento: 0.7487,
        },
      };

      expect(result).toBeDefined();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('Project Production Into 90 Days', () => {
    it('should be able to return projected values of a production', () => {
      const result = service.projectProduction(dto);

      const expectedResult: ProjectProductionResponseDto = {
        total: {
          kgEntradaTotal: 9180000,
          kgProduzidoTotal: 6873043,
        },
        mi: {
          kgTotalEntrada: 2295000,
          kgProduzidoTotal: 1812361, // No power bi 1812362, pq ele arredonda pra cima
          pProduzido: 0.2637,
        },
        me: {
          kgTotalEntrada: 6885000,
          kgProduzidoTotal: 5060682,
          pProduzido: 0.7363,
        },
      };
      expect(result).toBeDefined();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('Project Entries Into 90 Days', () => {
    it('should be able to get income entries projection into 90 days', () => {
      const result = service.projectEntries(dto);
      const expectedResult: ProjectEntriesResponseDto = {
        totalIncome: 200268958,
        totalIncomeEntriesMe: 153006398,
        totalIncomeEntriesMi: 47262560,
      };

      expect(result).toBeDefined();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('Project Outings Into 90 Days', () => {
    it('should be able to get outing expenses projection into 90 days', () => {
      const result = service.projectOutings(dto);
      const expectedResult: ProjectOutingsResponseDto = {
        compra: {
          valorTotalCompraCabecas: 185130000,
          valorTotalFrete: 2754000,
          me: {
            valorCompraCabecasMe: 139995000,
            valorFreteBoiMe: 2065500,
          },
          mi: {
            valorCompraCabecasMi: 45135000,
            valorFreteBoiMi: 688500,
          },
        },
        operacao: {
          arred: 0,
          embalagem: 3092869,
          mod: 2749217,
          me: {
            valorEmbalagemMe: 2277306.6975,
            valorModMe: 2024272.62,
            arredMe: 0,
          },
          mi: {
            valorEmbalagemMi: 815562.6749999999,
            valorModMi: 724944.6,
            arredMi: 0,
          },
        },
        vendas: {
          me: {
            rodov: 3795511,
            porto: 1265170,
            marit: 2277307,
            financ: 2024273,
          },
          mi: {
            frete: 2265452,
            comissao: 330838,
            imposto: 850726,
          },
        },
        totalExpenses: 206535363,
      };

      expect(result).toBeDefined();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('Project Operation Closure', () => {
    it('should be able to get the closure of all operation including incomes and expenses', () => {
      const response = service.projectOperationClosure(dto);

      const expectedResponse: ProjectOperationClosureResponseDto = {
        entradas: 200268958,
        saidas: 206535363,
        fechamento: -6266405, // 1 real a menos por conta de arredondamento
      };

      expect(response).toBeDefined();
      expect(response).toEqual(expectedResponse);
    });
  });

  describe('Project Cost By Kg Into 90 Days', () => {
    it('should return each cost with the respective cost by kg', () => {
      const result = service.projectCostByKg(dto);

      const expectedResult: ProjectCostByKgResponseDto = {
        // TODO
        total: {
          totalCustoAnimaisTotal: 187884000,
          totalCustoAnimaisMe: 142060500,
          totalCustoAnimaisMi: 45823500,
          totalCustoArrendTotal: 0,
          totalCustoArrendMe: 0,
          totalCustoArrendMi: 0,
          totalCustoKgAnimaisTotal: 20.47,
          totalCustoKgAnimaisMe: 20.63,
          totalCustoKgAnimaisMi: 19.97,
          totalCustoKgArrendTotal: 0,
          totalCustoKgArrendMe: 0,
          totalCustoKgArrendMi: 0,
          totalCustoKgTotal: 2.7, // 2.71 -> +1 por arredondamento
          totalCustoKgMe: 2.7,
          totalCustoKgMi: 2.75,
          totalCustoTotal: 18651363,
          totalCustoMe: 13663841, // 13663840 -1 por arredondamento
          totalCustoMi: 4987524, // 4987523 -1 por arredondamento
        },
        costs: {
          // OK
          custoMe: [
            {
              label: 'FRETE RODOV ME',
              value: 3795511,
              costByKg: 0.75,
            },
            {
              label: 'EMBALAGENS ME',
              value: 2277307,
              costByKg: 0.45,
            },
            {
              label: 'FRETE INTER ME',
              value: 2277307,
              costByKg: 0.45,
            },
            {
              label: 'FINANC ME',
              value: 2024273,
              costByKg: 0.4,
            },
            {
              label: 'MOD ME',
              value: 2024273,
              costByKg: 0.4,
            },
            {
              label: 'PORTO ME',
              value: 1265170,
              costByKg: 0.25,
            },
          ],
          // OK
          custoMeAnimais: [
            {
              label: 'ANIMAIS ME',
              value: 139995000,
              costByKg: 20.33,
            },
            {
              label: 'FRETE ME',
              value: 2065500,
              costByKg: 0.3,
            },
          ],
          // OK
          custoMeArred: [
            {
              label: 'ARRENDAMENTO ME',
              value: 0,
              costByKg: 0,
            },
          ],
          // OK
          custoMi: [
            {
              label: 'FRETE MI',
              value: 2265452,
              costByKg: 1.25,
            },
            {
              label: 'IMPOSTO MI',
              value: 850726,
              costByKg: 0.47,
            },
            {
              label: 'EMBALAGENS MI',
              value: 815563,
              costByKg: 0.45,
            },
            {
              label: 'MOD MI',
              value: 724945,
              costByKg: 0.4,
            },

            {
              label: 'COMISSAO MI',
              value: 330838,
              costByKg: 0.18,
            },
          ],
          // OK
          custoMiAnimais: [
            {
              label: 'ANIMAIS MI',
              value: 45135000,
              costByKg: 19.67,
            },
            {
              label: 'FRETE MI',
              value: 688500,
              costByKg: 0.3,
            },
          ],
          // OK
          custoMiArred: [
            {
              label: 'ARRENDAMENTO MI',
              value: 0,
              costByKg: 0,
            },
          ],

          // OK
          custoTotal: [
            {
              label: 'FRETE RODOV ME',
              value: 3795511,
              costByKg: 0.55,
            },
            {
              label: 'EMBALAGENS',
              value: 3092869,
              costByKg: 0.45,
            },
            {
              label: 'MOD',
              value: 2749217,
              costByKg: 0.4,
            },
            {
              label: 'FRETE INTER ME',
              value: 2277307,
              costByKg: 0.33,
            },
            {
              label: 'FRETE MI',
              value: 2265452,
              costByKg: 0.33,
            },
            {
              label: 'FINANC ME',
              value: 2024273,
              costByKg: 0.29,
            },
            {
              label: 'PORTO ME',
              value: 1265170,
              costByKg: 0.18,
            },
            {
              label: 'IMPOSTO MI',
              value: 850726,
              costByKg: 0.12,
            },
            {
              label: 'COMISSAO MI',
              value: 330838,
              costByKg: 0.05,
            },
          ],

          // OK
          custoTotalAnimais: [
            {
              label: 'ANIMAIS',
              value: 185130000,
              costByKg: 20.17,
            },
            {
              label: 'FRETE',
              value: 2754000,
              costByKg: 0.3,
            },
          ],

          // OK
          custoTotalArred: [
            {
              label: 'ARRENDAMENTO',
              value: 0,
              costByKg: 0,
            },
          ],
        },
        kpis: {
          me: {
            custoKgFinalMe: 23.33,
            vendaKgMe: 30.23,
            margemBrutaMe: 0.0434,
            margemLiquidaMe: -0.0178,
          },
          mi: {
            custoKgFinalMi: expect.closeTo(22.72, 2),
            vendaKgMi: 26.08,
            margemBrutaMi: -0.0021,
            margemLiquidaMi: -0.0751,
          },
          total: {
            custoKgFinal: 23.17, // -0.01 por conta de arredondamento
            vendaKg: 29.14,
            margemBruta: 0.0327,
            margemLiquida: -0.0313,
          },
        },
      };

      expect(result).toBeDefined();
      expect(result).toEqual(expectedResult);
    });
  });
});
