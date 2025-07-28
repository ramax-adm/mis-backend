import { Injectable } from '@nestjs/common';
import { GetProductionValuesResponseDto } from './dtos/get-production-values-response.dto';
import { ProjectProductionResponseDto } from './dtos/project-production-response.dto';
import { NumberUtils } from '../utils/services/number.utils';
import { ProjectEntriesResponseDto } from './dtos/project-entries-response.dto';
import { GetMeIncomes, GetMiIncomes } from './dtos/common/income.dto';
import {
  ProductionEntriesDto,
  ProductedMeEntryDto,
  ProductedMiEntryDto,
} from './dtos/common/entries.dto';
import { CommonDto, GetTotalProjectionDaysDto } from './dtos/common/common.dto';
import { ProjectOutingsResponseDto } from './dtos/project-outings-response.dto';
import { ProjectOperationClosureResponseDto } from './dtos/project-operation-closure-response.dto';
import {
  CostsProjected,
  CostsTotals,
  KpisProjected,
  ProjectCostByKgResponseDto,
} from './dtos/project-cost-by-kg-response.dto';
import {
  DailyFlowProjection,
  ProjectDailyFlowResponseDto,
} from './dtos/project-daily-flow-response.dto';
import { MeIncomeControlsDto } from './dtos/controls/me-income-controls.dto';
import { MiIncomeControlsDto } from './dtos/controls/mi-income-controls.dto';
import { TipoArrendEnum } from './enums/tipo-arrend.enum';
import { Repository } from 'typeorm';
import { CashFlowProduct } from './entities/cash-flow-product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MarketEnum } from '@/core/enums/sensatta/markets.enum';

@Injectable()
export class CashFlowService {
  constructor() {}

  /** Metodos auxiliares */

  getArrendWeight(tipoArrend: string, kgEntrada: number, kgProduzido: number) {
    /**
     * SE TIPO_ARREND = KG ENTRADA => arredKg * KG_ENTRADA * DIAS_PROJECAO
     * SE TIPO_ARREND = KG SAIDA => arredKg * KG_PRODUZIDO * DIAS_PROJECAO
     */
    let arredWeight = 0;
    if (tipoArrend === TipoArrendEnum.KG_ENTRADA) {
      arredWeight = kgEntrada;
    } else if (tipoArrend === TipoArrendEnum.KG_SAIDA) {
      arredWeight = kgProduzido;
    }

    return arredWeight;
  }

  getTotalProjectionDays(dto: GetTotalProjectionDaysDto): number {
    const diasProjecao = dto.diasProjecao;

    const overDays = [];

    // Dias a mais CMP
    const cattleBuyOverDays = dto.diasPagamento - 1;
    overDays.push(cattleBuyOverDays);

    // Dias a mais FRT CMP
    const cattleBuyFreightOverDays = dto.diasPagamentoFrete - 1;
    overDays.push(cattleBuyFreightOverDays);
    // Dias a mais Venda MI
    const miSallesOverDays = dto.vendasMiDias - 1;
    overDays.push(miSallesOverDays);
    // Dias a mais Venda ME
    const meSallesOverDays = dto.vendasMeDias - 1;
    overDays.push(meSallesOverDays);

    // Dias a mais OP
    const operationCostsOverDays =
      dto.diasPagamentoProdutos > diasProjecao
        ? dto.diasPagamentoProdutos - diasProjecao
        : (Math.floor(diasProjecao / dto.diasPagamentoProdutos) + 1) *
            dto.diasPagamentoProdutos -
          diasProjecao;

    overDays.push(operationCostsOverDays);

    const maxOverDay = overDays.sort((a, b) => b - a)[0];
    return diasProjecao + maxOverDay;
  }

  // Rendimentos Mi
  getMiTotalIncomes(dto: MiIncomeControlsDto) {
    const {
      dt: { pAcem, pCupim, pMusculo, pPaleta, pPeito, pRecortes },
      pa: { pBifeVazio, pCostela },
      tr: {
        pBananinha,
        pCapaFile,
        pContraFile,
        pCorAlcatra,
        pCoxaoDuro,
        pCoxaoMole,
        pFileMignon,
        pFralda,
        pGordura,
        pLagarto,
        pMaminha,
        pMusculo: pMusculoTr,
        pPatinho,
        pPicanha,
        pRecAlcatra,
        pRecortes: pRecortesTr,
      },
    } = dto;

    const totalDtIncome = NumberUtils.nb4(
      pAcem + pCupim + pMusculo + pPaleta + pPeito + pRecortes,
    );

    const totalTrIncome = NumberUtils.nb4(
      pBananinha +
        pCapaFile +
        pContraFile +
        pCorAlcatra +
        pCoxaoDuro +
        pCoxaoMole +
        pFileMignon +
        pFralda +
        pGordura +
        pLagarto +
        pMaminha +
        pMusculoTr +
        pPatinho +
        pPicanha +
        pRecAlcatra +
        pRecortesTr,
    );

    const totalPaIncome = NumberUtils.nb4(pBifeVazio + pCostela);

    return {
      totalDtIncome,
      totalTrIncome,
      totalPaIncome,
    };
  }

  // Rendimentos Me
  getMeTotalIncomes(dto: MeIncomeControlsDto) {
    const {
      dt: { pAcem, pGorduraExt, pGorduraInt, pPaleta, pMusculo, pPeito },
      pa: { pCostela },
      tr: {
        pBananinha,
        pFileCostela,
        pMusculoDuro,
        pMusculoMole,
        pRoubado,
        pContraFile,
        pCorAlcatra,
        pCoxaoDuro,
        pCoxaoMole,
        pFileMignon,
        pFralda,
        pLagarto,
        pMaminha,
        pPatinho,
        pPicanha,
        pRecortes: pRecortesTr,
      },
    } = dto;

    const totalDtIncome = NumberUtils.nb4(
      pAcem + pGorduraExt + pGorduraInt + pPaleta + pMusculo + pPeito,
    );

    const totalTrIncome = NumberUtils.nb4(
      pBananinha +
        pFileCostela +
        pContraFile +
        pCorAlcatra +
        pCoxaoDuro +
        pCoxaoMole +
        pFileMignon +
        pFralda +
        pMusculoDuro +
        pLagarto +
        pMaminha +
        pMusculoMole +
        pPatinho +
        pPicanha +
        pRoubado +
        pRecortesTr,
    );

    const totalPaIncome = NumberUtils.nb4(pCostela);

    return {
      totalDtIncome,
      totalTrIncome,
      totalPaIncome,
    };
  }

  // Entrada p/ quarteio
  getTotalEntries(dto: ProductionEntriesDto) {
    const { cbs, pesoArroba, pDt, pPa, pTr } = dto;

    const totalEntriesInKg = cbs * pesoArroba * 15;
    const totalDtEntriesInKg = totalEntriesInKg * pDt;
    const totalPaEntriesInKg = totalEntriesInKg * pPa;
    const totalTrEntriesInKg = totalEntriesInKg * pTr;

    return {
      totalEntriesInKg,
      totalDtEntriesInKg,
      totalPaEntriesInKg,
      totalTrEntriesInKg,
    };
  }

  // Produzida Me
  getProductedMeEntry(dto: ProductedMeEntryDto) {
    const {
      totalMeDtEntriesInKg,
      totalMeDtIncome,
      totalMePaEntriesInKg,
      totalMePaIncome,
      totalMeTrEntriesInKg,
      totalMeTrIncome,
    } = dto;

    const totalDtProductedInKg = totalMeDtEntriesInKg * totalMeDtIncome;
    const totalTrProductedInKg = totalMeTrEntriesInKg * totalMeTrIncome;
    const totalPaProductedInKg = totalMePaEntriesInKg * totalMePaIncome;

    return {
      totalMeProducted:
        totalDtProductedInKg + totalTrProductedInKg + totalPaProductedInKg,
      totalDtProductedInKg,
      totalTrProductedInKg,
      totalPaProductedInKg,
    };
  }

  // Produzida Mi
  getProductedMiEntry(dto: ProductedMiEntryDto) {
    const {
      totalMiDtEntriesInKg,
      totalMiDtIncome,
      totalMiPaEntriesInKg,
      totalMiPaIncome,
      totalMiTrEntriesInKg,
      totalMiTrIncome,
    } = dto;

    const totalDtProductedInKg = totalMiDtEntriesInKg * totalMiDtIncome;
    const totalTrProductedInKg = totalMiTrEntriesInKg * totalMiTrIncome;
    const totalPaProductedInKg = totalMiPaEntriesInKg * totalMiPaIncome;

    return {
      totalMiProducted:
        totalDtProductedInKg + totalTrProductedInKg + totalPaProductedInKg,
      totalDtProductedInKg,
      totalTrProductedInKg,
      totalPaProductedInKg,
    };
  }

  // RECEITAS ME
  getMeIncomes(dto: GetMeIncomes) {
    const { cbsMe, pDt, pPa, pTr, pesoArroba } = dto.matPrima;
    const {
      totalDtEntriesInKg: entradaDtMe,
      totalPaEntriesInKg: entradaPaMe,
      totalTrEntriesInKg: entradaTrMe,
    } = this.getTotalEntries({
      cbs: cbsMe,
      pDt: pDt,
      pPa: pPa,
      pTr: pTr,
      pesoArroba: pesoArroba,
    });

    const {
      dt: rendimentosDtMe,
      pa: rendimentosPaMe,
      tr: rendimentosTrMe,
    } = dto.rendimentos;

    const { dt: precosDtMe, pa: precosPaMe, tr: precosTrMe } = dto.precos;

    const dtMeIncomeKeys = Object.keys(rendimentosDtMe);
    const trMeIncomeKeys = Object.keys(rendimentosTrMe);
    const paMeIncomeKeys = Object.keys(rendimentosPaMe);

    let totalMeEntries = 0;
    for (const key of dtMeIncomeKeys) {
      totalMeEntries +=
        entradaDtMe * rendimentosDtMe[key] * precosDtMe[key] * dto.ptax;
    }
    for (const key of trMeIncomeKeys) {
      totalMeEntries +=
        entradaTrMe * rendimentosTrMe[key] * precosTrMe[key] * dto.ptax;
    }
    for (const key of paMeIncomeKeys) {
      totalMeEntries +=
        entradaPaMe * rendimentosPaMe[key] * precosPaMe[key] * dto.ptax;
    }

    return { totalMeEntries };
  }

  // RECEITAS MI
  getMiIncomes(dto: GetMiIncomes) {
    const { cbsMi, pDt, pPa, pTr, pesoArroba } = dto.matPrima;
    const {
      totalDtEntriesInKg: entradaDtMi,
      totalPaEntriesInKg: entradaPaMi,
      totalTrEntriesInKg: entradaTrMi,
    } = this.getTotalEntries({
      cbs: cbsMi,
      pDt: pDt,
      pPa: pPa,
      pTr: pTr,
      pesoArroba: pesoArroba,
    });

    const {
      dt: rendimentosDtMi,
      pa: rendimentosPaMi,
      tr: rendimentosTrMi,
    } = dto.rendimentos;

    const { dt: precosDtMi, pa: precosPaMi, tr: precosTrMi } = dto.precos;

    const dtMiIncomeKeys = Object.keys(precosDtMi);
    const trMiIncomeKeys = Object.keys(precosTrMi);
    const paMiIncomeKeys = Object.keys(precosPaMi);

    let totalMiEntries = 0;
    for (const key of dtMiIncomeKeys) {
      totalMiEntries += entradaDtMi * rendimentosDtMi[key] * precosDtMi[key];
    }
    for (const key of trMiIncomeKeys) {
      totalMiEntries += entradaTrMi * rendimentosTrMi[key] * precosTrMi[key];
    }
    for (const key of paMiIncomeKeys) {
      totalMiEntries += entradaPaMi * rendimentosPaMi[key] * precosPaMi[key];
    }

    return { totalMiEntries };
  }

  // BREAK EVEN
  getBreakEven(dto: ProjectDailyFlowResponseDto): number | null {
    const breakEvens = [];
    for (const flow of dto.dailyFlow) {
      const isBreakEven = flow.dia > 20 && flow.recTotalAcc >= flow.saidasAcc;
      if (isBreakEven) {
        breakEvens.push(flow.dia);
      }
    }

    if (breakEvens.length > 0) {
      return breakEvens[0];
    } else {
      return null;
    }
  }

  // BREAK EVEN FINAL
  getFinalBreakEven(dto: ProjectDailyFlowResponseDto): number | null {
    const dailyFlowLastRegistry = dto.dailyFlow.length - 1;
    const haveCashFlowEndedPositive =
      dto.dailyFlow[dailyFlowLastRegistry].recTotalAcc >=
      dto.dailyFlow[dailyFlowLastRegistry].saidasAcc;

    if (haveCashFlowEndedPositive) {
      const breakEvens = [];
      for (const flow of dto.dailyFlow) {
        if (flow.dia <= dto.diasPosicao) {
          continue;
        }

        if (flow.recTotalAcc >= flow.saidasAcc) {
          breakEvens.push(flow.dia);
        }
      }

      if (breakEvens.length > 0) {
        return breakEvens[breakEvens.length - 1];
      } else {
        return null;
      }
    }
  }

  /********************************************************************* */
  /** Metodos de calculo e projecao */

  // ENTRADA E PRODUCAO
  getProductionValues(dto: CommonDto): GetProductionValuesResponseDto {
    const { cbsMe, cbsMi, pDt, pPa, pTr, pesoArroba } = dto.matPrima;

    // Entradas ME
    const {
      totalDtEntriesInKg: totalMeDtEntriesInKg,
      totalPaEntriesInKg: totalMePaEntriesInKg,
      totalTrEntriesInKg: totalMeTrEntriesInKg,
    } = this.getTotalEntries({
      cbs: cbsMe,
      pesoArroba,
      pDt,
      pPa,
      pTr,
    });

    const { rendimentosMe, rendimentosMi } = dto;

    // Rendimentos ME
    const {
      totalDtIncome: totalMeDtIncome,
      totalPaIncome: totalMePaIncome,
      totalTrIncome: totalMeTrIncome,
    } = this.getMeTotalIncomes(rendimentosMe);

    // KG produzido ME
    const {
      totalDtProductedInKg: totalMeDtProductedInKg,
      totalPaProductedInKg: totalMePaProductedInKg,
      totalTrProductedInKg: totalMeTrProductedInKg,
    } = this.getProductedMeEntry({
      totalMeDtEntriesInKg,
      totalMeTrEntriesInKg,
      totalMePaEntriesInKg,
      totalMeDtIncome,
      totalMeTrIncome,
      totalMePaIncome,
    });

    // Entradas MI
    const {
      totalDtEntriesInKg: totalMiDtEntriesInKg,
      totalPaEntriesInKg: totalMiPaEntriesInKg,
      totalTrEntriesInKg: totalMiTrEntriesInKg,
    } = this.getTotalEntries({
      cbs: cbsMi,
      pesoArroba,
      pDt,
      pPa,
      pTr,
    });

    // Rendimento MI
    const {
      totalDtIncome: totalMiDtIncome,
      totalPaIncome: totalMiPaIncome,
      totalTrIncome: totalMiTrIncome,
    } = this.getMiTotalIncomes(rendimentosMi);

    // KG produzido MI
    const {
      totalDtProductedInKg: totalMiDtProductedInKg,
      totalPaProductedInKg: totalMiPaProductedInKg,
      totalTrProductedInKg: totalMiTrProductedInKg,
    } = this.getProductedMiEntry({
      totalMiDtEntriesInKg,
      totalMiTrEntriesInKg,
      totalMiPaEntriesInKg,
      totalMiDtIncome,
      totalMiTrIncome,
      totalMiPaIncome,
    });

    // Response
    const meResponse = {
      dt: {
        entradaDt: totalMeDtEntriesInKg,
        kgRendimentoDt: totalMeDtProductedInKg,
        pRendimentoDt: NumberUtils.nb4(totalMeDtIncome),
      },
      pa: {
        entradaPa: totalMePaEntriesInKg,
        kgRendimentoPa: totalMePaProductedInKg,
        pRendimentoPa: NumberUtils.nb4(totalMePaIncome),
      },
      tr: {
        entradaTr: totalMeTrEntriesInKg,
        kgRendimentoTr: totalMeTrProductedInKg,
        pRendimentoTr: NumberUtils.nb4(totalMeTrIncome),
      },
    };
    const miResponse = {
      dt: {
        entradaDt: totalMiDtEntriesInKg,
        kgRendimentoDt: totalMiDtProductedInKg,
        pRendimentoDt: NumberUtils.nb4(totalMiDtIncome),
      },
      pa: {
        entradaPa: totalMiPaEntriesInKg,
        kgRendimentoPa: totalMiPaProductedInKg,
        pRendimentoPa: NumberUtils.nb4(totalMiPaIncome),
      },
      tr: {
        entradaTr: totalMiTrEntriesInKg,
        kgRendimentoTr: totalMiTrProductedInKg,
        pRendimentoTr: NumberUtils.nb4(totalMiTrIncome),
      },
    };

    // Total por quarteio
    const entradaDtTotal = totalMeDtEntriesInKg + totalMiDtEntriesInKg;
    const entradaPaTotal = totalMePaEntriesInKg + totalMiPaEntriesInKg;
    const entradaTrTotal = totalMeTrEntriesInKg + totalMiTrEntriesInKg;

    const kgRendimentoDtTotal =
      miResponse.dt.kgRendimentoDt + meResponse.dt.kgRendimentoDt;
    const kgRendimentoPaTotal =
      miResponse.pa.kgRendimentoPa + meResponse.pa.kgRendimentoPa;
    const kgRendimentoTrTotal =
      miResponse.tr.kgRendimentoTr + meResponse.tr.kgRendimentoTr;
    const totalByQuartering = {
      dt: {
        entradaDt: entradaDtTotal,
        kgProduzidoDt: kgRendimentoDtTotal,
        pRendimentoDt: NumberUtils.nb4(kgRendimentoDtTotal / entradaDtTotal),
      },
      pa: {
        entradaPa: entradaPaTotal,
        kgProduzidoPa: kgRendimentoPaTotal,
        pRendimentoPa: NumberUtils.nb4(kgRendimentoPaTotal / entradaPaTotal),
      },
      tr: {
        entradaTr: entradaTrTotal,
        kgProduzidoTr: kgRendimentoTrTotal,
        pRendimentoTr: NumberUtils.nb4(kgRendimentoTrTotal / entradaTrTotal),
      },
    };

    const kgEntradaMiTotal =
      miResponse.dt.entradaDt +
      miResponse.tr.entradaTr +
      miResponse.pa.entradaPa;
    const kgProduzidoMiTotal =
      miResponse.dt.kgRendimentoDt +
      miResponse.tr.kgRendimentoTr +
      miResponse.pa.kgRendimentoPa;

    const kgEntradaMeTotal =
      meResponse.dt.entradaDt +
      meResponse.tr.entradaTr +
      meResponse.pa.entradaPa;
    const kgProduzidoMeTotal =
      meResponse.dt.kgRendimentoDt +
      meResponse.tr.kgRendimentoTr +
      meResponse.pa.kgRendimentoPa;

    const kgEntradaTotal =
      totalByQuartering.dt.entradaDt +
      totalByQuartering.tr.entradaTr +
      totalByQuartering.pa.entradaPa;
    const kgProduzidoTotal =
      totalByQuartering.dt.kgProduzidoDt +
      totalByQuartering.pa.kgProduzidoPa +
      totalByQuartering.tr.kgProduzidoTr;
    const total = {
      // MI
      kgEntradaMi: kgEntradaMiTotal,
      kgProduzidoMi: kgProduzidoMiTotal,
      pRendimentoMi: NumberUtils.nb4(kgProduzidoMiTotal / kgEntradaMiTotal),
      // ME
      kgEntradaMe: kgEntradaMeTotal,
      kgProduzidoMe: kgProduzidoMeTotal,
      pRendimentoMe: NumberUtils.nb4(kgProduzidoMeTotal / kgEntradaMeTotal),

      kgEntrada: kgEntradaTotal,
      kgProduzido: kgProduzidoTotal,
      pRendimento: NumberUtils.nb4(kgProduzidoTotal / kgEntradaTotal),
    };
    return {
      me: meResponse,
      mi: miResponse,
      totalByQuartering,
      total,
    };
  }

  // CENARIO 90 DIAS OPERACAO
  projectProduction(dto: CommonDto): ProjectProductionResponseDto {
    const DIAS_PROJECAO = dto.projecao.diasProjecao;

    // Dados de produção
    const { me, mi, total } = this.getProductionValues(dto);

    // Totais entrada
    const kgEntradaTotal = NumberUtils.nb0(total.kgEntrada * DIAS_PROJECAO);
    const kgProduzidoTotal = NumberUtils.nb0(total.kgProduzido * DIAS_PROJECAO);

    // ME
    const meKgProduzidoTotal = NumberUtils.nb0(
      (me.dt.kgRendimentoDt + me.tr.kgRendimentoTr + me.pa.kgRendimentoPa) *
        DIAS_PROJECAO,
    );
    const meKgTotalEntrada = NumberUtils.nb0(
      (me.dt.entradaDt + me.tr.entradaTr + me.pa.entradaPa) * DIAS_PROJECAO,
    );

    // MI
    const miKgProduzidoTotal = NumberUtils.nb0(
      (mi.dt.kgRendimentoDt + mi.tr.kgRendimentoTr + mi.pa.kgRendimentoPa) *
        DIAS_PROJECAO,
    );
    const miKgTotalEntrada = NumberUtils.nb0(
      (mi.dt.entradaDt + mi.tr.entradaTr + mi.pa.entradaPa) * DIAS_PROJECAO,
    );

    // % Produzido
    const mePorcentagemProduzido = NumberUtils.nb4(
      meKgProduzidoTotal / kgProduzidoTotal,
    );
    const miPorcentagemProduzido = NumberUtils.nb4(
      miKgProduzidoTotal / kgProduzidoTotal,
    );

    return {
      total: {
        kgEntradaTotal,
        kgProduzidoTotal,
      },
      me: {
        kgProduzidoTotal: meKgProduzidoTotal,
        kgTotalEntrada: meKgTotalEntrada,
        pProduzido: mePorcentagemProduzido,
      },
      mi: {
        kgProduzidoTotal: miKgProduzidoTotal,
        kgTotalEntrada: miKgTotalEntrada,
        pProduzido: miPorcentagemProduzido,
      },
    };
  }

  // ENTRADAS P/ 90 DIAS OPERACAO
  projectEntries(dto: CommonDto): ProjectEntriesResponseDto {
    const DIAS_PROJECAO = dto.projecao.diasProjecao;
    // ME
    const { totalMeEntries } = this.getMeIncomes({
      matPrima: dto.matPrima,
      rendimentos: dto.rendimentosMe,
      precos: dto.precosMe,
      ptax: dto.me.ptax,
    });

    // MI
    const { totalMiEntries } = this.getMiIncomes({
      matPrima: dto.matPrima,
      rendimentos: dto.rendimentosMi,
      precos: dto.precosMi,
    });

    return {
      totalIncomeEntriesMe: NumberUtils.nb0(totalMeEntries * DIAS_PROJECAO),
      totalIncomeEntriesMi: NumberUtils.nb0(totalMiEntries * DIAS_PROJECAO),
      totalIncome: NumberUtils.nb0(
        (totalMeEntries + totalMiEntries) * DIAS_PROJECAO,
      ),
    };
  }

  // SAIDAS P/ 90 DIAS OPERACAO
  projectOutings(dto: CommonDto): ProjectOutingsResponseDto {
    const DIAS_PROJECAO = dto.projecao.diasProjecao;

    const {
      matPrima: {
        cbsMe,
        cbsMi,
        pesoArroba,
        precoArrobaMe,
        precoArrobaMi,
        precoFreteKg,
      },
      operacao: { precoEmbalagem, precoMod, arredKg, tipoArrend },
      mi: { pImpostosMi, pComissoesMi, precoFreteMi },
      me: { precoFreteInter, precoFinanc, precoFreteRodoviario, precoPorto },
    } = dto;

    // Compra
    const valorCompraCabecasMi =
      cbsMi * pesoArroba * precoArrobaMi * DIAS_PROJECAO;
    const valorCompraCabecasMe =
      cbsMe * pesoArroba * precoArrobaMe * DIAS_PROJECAO;
    const valorTotalCompraCabecas = NumberUtils.nb0(
      valorCompraCabecasMe + valorCompraCabecasMi,
    );

    const valorFreteBoiMe = NumberUtils.nb0(
      cbsMe * pesoArroba * 15 * precoFreteKg * DIAS_PROJECAO,
    );
    const valorFreteBoiMi = NumberUtils.nb0(
      cbsMi * pesoArroba * 15 * precoFreteKg * DIAS_PROJECAO,
    );
    const valorTotalFrete = valorFreteBoiMe + valorFreteBoiMi;

    // Operacao
    const {
      total: {
        kgEntrada,
        kgEntradaMe,
        kgEntradaMi,
        kgProduzido,
        kgProduzidoMe,
        kgProduzidoMi,
      },
    } = this.getProductionValues(dto);

    // Arrend
    const arredWeight = this.getArrendWeight(
      tipoArrend,
      kgEntrada,
      kgProduzido,
    );
    const arred = arredKg * arredWeight * DIAS_PROJECAO;

    const arredMeWeight = this.getArrendWeight(
      tipoArrend,
      kgEntradaMe,
      kgProduzidoMe,
    );
    const arredMe = arredKg * arredMeWeight * DIAS_PROJECAO;

    const arredMiWeight = this.getArrendWeight(
      tipoArrend,
      kgEntradaMi,
      kgProduzidoMi,
    );
    const arredMi = arredKg * arredMiWeight * DIAS_PROJECAO;

    // Embalagem
    const valorEmbalagemMe = kgProduzidoMe * precoEmbalagem * DIAS_PROJECAO;
    const valorEmbalagemMi = kgProduzidoMi * precoEmbalagem * DIAS_PROJECAO;
    const valorEmbalagem = NumberUtils.nb0(valorEmbalagemMe + valorEmbalagemMi);

    // Mod
    const valorModMe = kgProduzidoMe * precoMod * DIAS_PROJECAO;
    const valorModMi = kgProduzidoMi * precoMod * DIAS_PROJECAO;
    const valorMod = NumberUtils.nb0(valorModMe + valorModMi);

    // Vendas Mi
    const { totalIncomeEntriesMi } = this.projectEntries(dto);
    const frete = NumberUtils.nb0(kgProduzidoMi * precoFreteMi * DIAS_PROJECAO);
    const comissao = NumberUtils.nb0(totalIncomeEntriesMi * pComissoesMi); // receita mi
    const imposto = NumberUtils.nb0(totalIncomeEntriesMi * pImpostosMi); // receita mi

    // Vendas Me
    const rodov = NumberUtils.nb0(
      kgProduzidoMe * precoFreteRodoviario * DIAS_PROJECAO,
    );
    const porto = NumberUtils.nb0(kgProduzidoMe * precoPorto * DIAS_PROJECAO);
    const marit = NumberUtils.nb0(
      kgProduzidoMe * precoFreteInter * DIAS_PROJECAO,
    );
    const financ = NumberUtils.nb0(kgProduzidoMe * precoFinanc * DIAS_PROJECAO);

    // TOTAL!!!!!
    const valorTotal =
      valorTotalCompraCabecas +
      valorTotalFrete +
      arred +
      valorEmbalagem +
      valorMod +
      financ +
      marit +
      porto +
      rodov +
      comissao +
      frete +
      imposto;

    const response = {
      compra: {
        valorTotalCompraCabecas: valorTotalCompraCabecas,
        valorTotalFrete: valorTotalFrete,
        me: {
          valorFreteBoiMe,
          valorCompraCabecasMe,
        },
        mi: {
          valorFreteBoiMi,
          valorCompraCabecasMi,
        },
      },
      operacao: {
        arred,
        embalagem: valorEmbalagem,
        mod: valorMod,
        me: { valorEmbalagemMe, valorModMe, arredMe },
        mi: {
          valorEmbalagemMi,
          valorModMi,
          arredMi,
        },
      },
      vendas: {
        me: {
          financ,
          marit,
          porto,
          rodov,
        },
        mi: {
          comissao,
          frete,
          imposto,
        },
      },
      totalExpenses: valorTotal,
    };
    return response;
  }

  // FECHAMENTO P/ 90 DIAS OPERACAO
  projectOperationClosure(dto: CommonDto): ProjectOperationClosureResponseDto {
    const { totalIncome } = this.projectEntries(dto);
    const { totalExpenses } = this.projectOutings(dto);

    return {
      saidas: totalExpenses,
      entradas: totalIncome,
      fechamento: totalIncome - totalExpenses,
    };
  }

  // PROJEÇÃO CUSTO POR KG
  projectCostByKg(dto: CommonDto): ProjectCostByKgResponseDto {
    const {
      // Dados que servem para as tabelas (custo-mi-me,custo R$/KG me,custo R$/KG mi)
      vendas: {
        me: { financ, marit, porto, rodov },
        mi: { comissao, frete: freteMi, imposto },
      },
      // Dados que servem para custo animais, custo animais me e custo animais mi
      compra: {
        valorTotalCompraCabecas,
        valorTotalFrete,
        me: { valorCompraCabecasMe, valorFreteBoiMe },
        mi: { valorCompraCabecasMi, valorFreteBoiMi },
      },
      operacao: {
        embalagem,
        mod,
        arred,
        me: { valorEmbalagemMe, valorModMe, arredMe },
        mi: { valorEmbalagemMi, valorModMi, arredMi },
      },
    } = this.projectOutings(dto);

    const { totalIncome, totalIncomeEntriesMe, totalIncomeEntriesMi } =
      this.projectEntries(dto);

    const {
      total: { kgProduzidoTotal, kgEntradaTotal },
      me: {
        kgProduzidoTotal: kgProduzidoTotalMe,
        kgTotalEntrada: kgTotalEntradaMe,
      },
      mi: {
        kgProduzidoTotal: kgProduzidoTotalMi,
        kgTotalEntrada: kgTotalEntradaMi,
      },
    } = this.projectProduction(dto);

    // Totais
    const custoTotal = [
      {
        label: 'FRETE RODOV ME',
        value: NumberUtils.nb0(rodov),
        costByKg: NumberUtils.nb2(rodov / kgProduzidoTotal),
      },
      {
        label: 'EMBALAGENS',
        value: NumberUtils.nb0(embalagem),
        costByKg: NumberUtils.nb2(embalagem / kgProduzidoTotal),
      },
      {
        label: 'MOD',
        value: NumberUtils.nb0(mod),
        costByKg: NumberUtils.nb2(mod / kgProduzidoTotal),
      },
      {
        label: 'FRETE INTER ME',
        value: NumberUtils.nb0(marit),
        costByKg: NumberUtils.nb2(marit / kgProduzidoTotal),
      },
      {
        label: 'FRETE MI',
        value: NumberUtils.nb0(freteMi),
        costByKg: NumberUtils.nb2(freteMi / kgProduzidoTotal),
      },
      {
        label: 'FINANC ME',
        value: NumberUtils.nb0(financ),
        costByKg: NumberUtils.nb2(financ / kgProduzidoTotal),
      },
      {
        label: 'PORTO ME',
        value: NumberUtils.nb0(porto),
        costByKg: NumberUtils.nb2(porto / kgProduzidoTotal),
      },
      {
        label: 'IMPOSTO MI',
        value: NumberUtils.nb0(imposto),
        costByKg: NumberUtils.nb2(imposto / kgProduzidoTotal),
      },
      {
        label: 'COMISSAO MI',
        value: NumberUtils.nb0(comissao),
        costByKg: NumberUtils.nb2(comissao / kgProduzidoTotal),
      },
    ];
    const custoTotalAnimais = [
      {
        label: 'ANIMAIS',
        value: NumberUtils.nb0(valorTotalCompraCabecas),
        costByKg: NumberUtils.nb2(valorTotalCompraCabecas / kgEntradaTotal),
      },
      {
        label: 'FRETE',
        value: NumberUtils.nb0(valorTotalFrete),
        costByKg: NumberUtils.nb2(valorTotalFrete / kgEntradaTotal),
      },
    ];
    const custoTotalArred = [
      {
        label: 'ARRENDAMENTO',
        value: arred,
        costByKg: NumberUtils.nb2(arred / kgEntradaTotal),
      },
    ];

    // ME
    const custoMe = [
      {
        label: 'FRETE RODOV ME',
        value: NumberUtils.nb0(rodov),
        costByKg: NumberUtils.nb2(rodov / kgProduzidoTotalMe),
      },
      {
        label: 'EMBALAGENS ME',
        value: NumberUtils.nb0(valorEmbalagemMe),
        costByKg: NumberUtils.nb2(valorEmbalagemMe / kgProduzidoTotalMe),
      },
      {
        label: 'FRETE INTER ME',
        value: NumberUtils.nb0(marit),
        costByKg: NumberUtils.nb2(marit / kgProduzidoTotalMe),
      },
      {
        label: 'FINANC ME',
        value: NumberUtils.nb0(financ),
        costByKg: NumberUtils.nb2(financ / kgProduzidoTotalMe),
      },
      {
        label: 'MOD ME',
        value: NumberUtils.nb0(valorModMe),
        costByKg: NumberUtils.nb2(valorModMe / kgProduzidoTotalMe),
      },
      {
        label: 'PORTO ME',
        value: NumberUtils.nb0(porto),
        costByKg: NumberUtils.nb2(porto / kgProduzidoTotalMe),
      },
    ];
    const custoMeAnimais = [
      {
        label: 'ANIMAIS ME',
        value: NumberUtils.nb0(valorCompraCabecasMe),
        costByKg: NumberUtils.nb2(valorCompraCabecasMe / kgTotalEntradaMe),
      },
      {
        label: 'FRETE ME',
        value: NumberUtils.nb0(valorFreteBoiMe),
        costByKg: NumberUtils.nb2(valorFreteBoiMe / kgTotalEntradaMe),
      },
    ];
    const custoMeArred = [
      {
        label: 'ARRENDAMENTO ME',
        value: arredMe,
        costByKg: NumberUtils.nb2(arredMe / kgTotalEntradaMe),
      },
    ];

    // MI
    const custoMi = [
      {
        label: 'FRETE MI',
        value: NumberUtils.nb0(freteMi),
        costByKg: NumberUtils.nb2(freteMi / kgProduzidoTotalMi),
      },
      {
        label: 'IMPOSTO MI',
        value: NumberUtils.nb0(imposto),
        costByKg: NumberUtils.nb2(imposto / kgProduzidoTotalMi),
      },
      {
        label: 'EMBALAGENS MI',
        value: NumberUtils.nb0(valorEmbalagemMi),
        costByKg: NumberUtils.nb2(valorEmbalagemMi / kgProduzidoTotalMi),
      },
      {
        label: 'MOD MI',
        value: NumberUtils.nb0(valorModMi),
        costByKg: NumberUtils.nb2(valorModMi / kgProduzidoTotalMi),
      },
      {
        label: 'COMISSAO MI',
        value: NumberUtils.nb0(comissao),
        costByKg: NumberUtils.nb2(comissao / kgProduzidoTotalMi),
      },
    ];
    const custoMiAnimais = [
      {
        label: 'ANIMAIS MI',
        value: NumberUtils.nb0(valorCompraCabecasMi),
        costByKg: NumberUtils.nb2(valorCompraCabecasMi / kgTotalEntradaMi),
      },
      {
        label: 'FRETE MI',
        value: NumberUtils.nb0(valorFreteBoiMi),
        costByKg: NumberUtils.nb2(valorFreteBoiMi / kgTotalEntradaMi),
      },
    ];
    const custoMiArred = [
      {
        label: 'ARRENDAMENTO MI',
        value: arredMi,
        costByKg: NumberUtils.nb2(arredMi / kgTotalEntradaMi),
      },
    ];

    // Totais
    const totalCustoTotal = custoTotal.reduce(
      (acc, item) => acc + item.value,
      0,
    );
    const totalCustoKgTotal = custoTotal.reduce(
      (acc, item) => acc + item.costByKg,
      0,
    );
    const totalCustoAnimaisTotal = custoTotalAnimais.reduce(
      (acc, item) => acc + item.value,
      0,
    );
    const totalCustoKgAnimaisTotal = custoTotalAnimais.reduce(
      (acc, item) => acc + item.costByKg,
      0,
    );
    const totalCustoArrendTotal = custoTotalArred.reduce(
      (acc, item) => acc + item.value,
      0,
    );
    const totalCustoKgArrendTotal = custoTotalArred.reduce(
      (acc, item) => acc + item.costByKg,
      0,
    );

    const totalCustoMi = custoMi.reduce((acc, item) => acc + item.value, 0);
    const totalCustoKgMi = custoMi.reduce(
      (acc, item) => acc + item.costByKg,
      0,
    );
    const totalCustoAnimaisMi = custoMiAnimais.reduce(
      (acc, item) => acc + item.value,
      0,
    );
    const totalCustoKgAnimaisMi = custoMiAnimais.reduce(
      (acc, item) => acc + item.costByKg,
      0,
    );
    const totalCustoArrendMi = custoMiArred.reduce(
      (acc, item) => acc + item.value,
      0,
    );
    const totalCustoKgArrendMi = custoMiArred.reduce(
      (acc, item) => acc + item.costByKg,
      0,
    );

    const totalCustoMe = custoMe.reduce((acc, item) => acc + item.value, 0);
    const totalCustoKgMe = custoMe.reduce(
      (acc, item) => acc + item.costByKg,
      0,
    );

    const totalCustoAnimaisMe = custoMeAnimais.reduce(
      (acc, item) => acc + item.value,
      0,
    );
    const totalCustoKgAnimaisMe = custoMeAnimais.reduce(
      (acc, item) => acc + item.costByKg,
      0,
    );
    const totalCustoArrendMe = custoMeArred.reduce(
      (acc, item) => acc + item.value,
      0,
    );
    const totalCustoKgArrendMe = custoMeArred.reduce(
      (acc, item) => acc + item.costByKg,
      0,
    );
    const total: CostsTotals = {
      totalCustoTotal: NumberUtils.nb2(totalCustoTotal),
      totalCustoKgTotal: NumberUtils.nb2(totalCustoKgTotal),
      totalCustoAnimaisTotal: NumberUtils.nb2(totalCustoAnimaisTotal),
      totalCustoKgAnimaisTotal: NumberUtils.nb2(totalCustoKgAnimaisTotal),
      totalCustoArrendTotal: NumberUtils.nb2(totalCustoArrendTotal),
      totalCustoKgArrendTotal: NumberUtils.nb2(totalCustoKgArrendTotal),
      totalCustoMi: NumberUtils.nb2(totalCustoMi),
      totalCustoKgMi: NumberUtils.nb2(totalCustoKgMi),
      totalCustoAnimaisMi: NumberUtils.nb2(totalCustoAnimaisMi),
      totalCustoKgAnimaisMi: NumberUtils.nb2(totalCustoKgAnimaisMi),
      totalCustoArrendMi: NumberUtils.nb2(totalCustoArrendMi),
      totalCustoKgArrendMi: NumberUtils.nb2(totalCustoKgArrendMi),
      totalCustoMe: NumberUtils.nb2(totalCustoMe),
      totalCustoKgMe: NumberUtils.nb2(totalCustoKgMe),
      totalCustoAnimaisMe: NumberUtils.nb2(totalCustoAnimaisMe),
      totalCustoKgAnimaisMe: NumberUtils.nb2(totalCustoKgAnimaisMe),
      totalCustoArrendMe: NumberUtils.nb2(totalCustoArrendMe),
      totalCustoKgArrendMe: NumberUtils.nb2(totalCustoKgArrendMe),
    };

    // RESPONSE
    const costs: CostsProjected = {
      custoTotal,
      custoTotalAnimais,
      custoTotalArred,
      custoMe,
      custoMeAnimais,
      custoMeArred,
      custoMi,
      custoMiAnimais,
      custoMiArred,
    };

    const custoKgFinalMe =
      costs.custoMe.reduce((acc, item) => acc + item.costByKg, 0) +
      costs.custoMeAnimais.reduce((acc, item) => acc + item.costByKg, 0) +
      costs.custoMeArred.reduce((acc, item) => acc + item.costByKg, 0);

    const custoKgFinalMi =
      costs.custoMi.reduce((acc, item) => acc + item.costByKg, 0) +
      costs.custoMiAnimais.reduce((acc, item) => acc + item.costByKg, 0) +
      costs.custoMiArred.reduce((acc, item) => acc + item.costByKg, 0);

    const custoKgFinal =
      costs.custoTotal.reduce((acc, item) => acc + item.costByKg, 0) +
      costs.custoTotalAnimais.reduce((acc, item) => acc + item.costByKg, 0) +
      costs.custoTotalArred.reduce((acc, item) => acc + item.costByKg, 0);

    const custoFinalMe =
      costs.custoMe.reduce((acc, item) => acc + item.value, 0) +
      costs.custoMeAnimais.reduce((acc, item) => acc + item.value, 0) +
      costs.custoMeArred.reduce((acc, item) => acc + item.value, 0);

    const custoFinalMi =
      costs.custoMi.reduce((acc, item) => acc + item.value, 0) +
      costs.custoMiAnimais.reduce((acc, item) => acc + item.value, 0) +
      costs.custoMiArred.reduce((acc, item) => acc + item.value, 0);

    const custoFinal =
      costs.custoTotal.reduce((acc, item) => acc + item.value, 0) +
      costs.custoTotalAnimais.reduce((acc, item) => acc + item.value, 0) +
      costs.custoTotalArred.reduce((acc, item) => acc + item.value, 0);

    const margemBrutaMe = NumberUtils.nb4(
      (totalIncomeEntriesMe -
        (valorCompraCabecasMe +
          valorFreteBoiMe +
          valorEmbalagemMe +
          valorModMe +
          arredMe)) / // Arrend
        totalIncomeEntriesMe,
    );

    const margemBrutaMi = NumberUtils.nb4(
      (totalIncomeEntriesMi -
        (valorCompraCabecasMi +
          valorFreteBoiMi +
          valorEmbalagemMi +
          valorModMi +
          arredMi)) / // Arrend
        totalIncomeEntriesMi,
    );

    const margemBruta = NumberUtils.nb4(
      (totalIncome -
        (valorTotalCompraCabecas + valorTotalFrete + embalagem + mod + arred)) /
        totalIncome,
    );

    const margemLiquidaMe = NumberUtils.nb4(
      (totalIncomeEntriesMe - custoFinalMe) / totalIncomeEntriesMe,
    );

    const margemLiquidaMi = NumberUtils.nb4(
      (totalIncomeEntriesMi - custoFinalMi) / totalIncomeEntriesMi,
    );

    const margemLiquida = NumberUtils.nb4(
      (totalIncome - custoFinal) / totalIncome,
    );

    const kpis: KpisProjected = {
      me: {
        custoKgFinalMe,
        vendaKgMe: NumberUtils.nb2(totalIncomeEntriesMe / kgProduzidoTotalMe),
        margemBrutaMe,
        margemLiquidaMe,
      },
      mi: {
        custoKgFinalMi,
        vendaKgMi: NumberUtils.nb2(totalIncomeEntriesMi / kgProduzidoTotalMi),
        margemBrutaMi,
        margemLiquidaMi,
      },
      total: {
        custoKgFinal,
        vendaKg: NumberUtils.nb2(totalIncome / kgProduzidoTotal),
        margemBruta,
        margemLiquida,
      },
    };

    return {
      total,
      costs,
      kpis,
    };
  }

  // FLUXO DIARIO 90 DIAS
  projectDailyFlow(dto: CommonDto): ProjectDailyFlowResponseDto {
    const TOTAL_DIAS_PROJECAO = this.getTotalProjectionDays({
      diasPagamento: dto.matPrima.diasPagamento,
      diasPagamentoFrete: dto.matPrima.diasPagamentoFrete,
      diasPagamentoProdutos: dto.operacao.diasPagamentoProdutos,
      diasProjecao: dto.projecao.diasProjecao,
      vendasMeDias: dto.me.vendasMeDias,
      vendasMiDias: dto.mi.vendasMiDias,
    });

    const {
      projecao: { diasProjecao },
      matPrima: {
        cbsMe,
        cbsMi,
        pesoArroba,
        precoArrobaMe,
        precoArrobaMi,
        precoFreteKg,
        diasPagamento,
        diasPagamentoFrete,
      },
      operacao: {
        precoEmbalagem,
        precoMod,
        diasPagamentoProdutos,
        arredKg,
        tipoArrend,
      },
      mi: { pImpostosMi, pComissoesMi, precoFreteMi, vendasMiDias },
      me: {
        precoFreteInter,
        precoFinanc,
        precoFreteRodoviario,
        precoPorto,
        pAntecipacaoMe,
        vendasMeDias,
        diasPosicao,
      },
    } = dto;

    // PAGAMENTO COMPRA BOI - DIA
    const valorCompraCabecasMi = cbsMi * pesoArroba * precoArrobaMi;
    const valorCompraCabecasMe = cbsMe * pesoArroba * precoArrobaMe;
    const valorTotalCompraCabecas = NumberUtils.nb0(
      valorCompraCabecasMe + valorCompraCabecasMi,
    );

    const valorFreteBoiMe = NumberUtils.nb0(
      cbsMe * pesoArroba * 15 * precoFreteKg,
    );
    const valorFreteBoiMi = NumberUtils.nb0(
      cbsMi * pesoArroba * 15 * precoFreteKg,
    );
    const valorTotalFrete = valorFreteBoiMe + valorFreteBoiMi;

    // PAGAMENTO OPERACAO - DIA
    const {
      total: {
        kgEntrada,
        kgProduzidoMe,
        kgProduzidoMi,
        kgProduzido: kgProduzidoTotal,
      },
    } = this.getProductionValues(dto);

    const arredWeight = this.getArrendWeight(
      tipoArrend,
      kgEntrada,
      kgProduzidoTotal,
    );
    const valorArrend = arredKg * arredWeight;
    const valorEmbalagem = kgProduzidoTotal * precoEmbalagem;
    const valorMod = kgProduzidoTotal * precoMod;

    // RECEITAS VENDA MI - DIA
    const { totalMiEntries } = this.getMiIncomes({
      matPrima: dto.matPrima,
      precos: dto.precosMi,
      rendimentos: dto.rendimentosMi,
    });
    const freteMi = kgProduzidoMi * precoFreteMi;
    const comissaoMi = totalMiEntries * pComissoesMi;
    const impostoMi = totalMiEntries * pImpostosMi;

    // RECEITAS VENDA ME - DIA
    const { totalMeEntries } = this.getMeIncomes({
      matPrima: dto.matPrima,
      precos: dto.precosMe,
      rendimentos: dto.rendimentosMe,
      ptax: dto.me.ptax,
    });

    const freteRodMe = kgProduzidoMe * precoFreteRodoviario;
    const portoMe = kgProduzidoMe * precoPorto;
    const maritMe = kgProduzidoMe * precoFreteInter;
    const financMe = kgProduzidoMe * precoFinanc;

    // REC 40
    const incomesMeAntecipated = totalMeEntries * pAntecipacaoMe;

    // REC 60
    const incomesMeReckoning = totalMeEntries * (1 - pAntecipacaoMe); // 0.6 é uma constante

    // ACUMULADORES
    let dia = 1;
    let acc = 0;
    let saidasAcc = 0;
    let recTotalAcc = 0;

    const response: ProjectDailyFlowResponseDto = {
      diasPosicao,
      breakEven: null,
      breakEvenFinal: null,
      dailyFlow: [],
    };
    while (dia <= TOTAL_DIAS_PROJECAO) {
      const data = {
        dia,
        compraBoi: 0,
        freteBoi: 0,
        arrend: 0,
        embalagem: 0,
        mod: 0,
        freteMi: 0,
        comissaoMi: 0,
        impostoMi: 0,
        freteRodMe: 0,
        portoMe: 0,
        maritMe: 0,
        financMe: 0,
        saidas: 0,
        saidasAcc: 0,
        recMe40: 0,
        recMe60: 0,
        recMe: 0,
        recMi: 0,
        recTotal: 0,
        recTotalAcc: 0,
        recTotalWithExpenses: 0,
        acc,
      } as DailyFlowProjection;

      // PAGAMENTO DE COMPRA BOI
      const isCattlePaymentDate =
        dia >= diasPagamento && dia < diasProjecao + diasPagamento;
      if (isCattlePaymentDate) {
        Object.assign(data, { compraBoi: valorTotalCompraCabecas });
      }

      const isShippingPaymentDate =
        dia >= diasPagamentoFrete && dia < diasProjecao + diasPagamentoFrete;
      if (isShippingPaymentDate) {
        Object.assign(data, { freteBoi: valorTotalFrete });
      }

      // PAGAMENTO DE CUSTOS DA OPERAÇÃO
      const isOperationCostPaymentDay = dia % diasPagamentoProdutos === 0;
      if (isOperationCostPaymentDay) {
        const isOperationPaymentDayOverProjectionDay =
          diasPagamentoProdutos > diasProjecao;

        const qtdDiasPagamento = isOperationPaymentDayOverProjectionDay
          ? diasProjecao
          : dia <= diasProjecao
            ? diasPagamentoProdutos
            : diasPagamentoProdutos - (dia - diasProjecao);

        const arrend = valorArrend * qtdDiasPagamento;
        const embalagem = valorEmbalagem * qtdDiasPagamento;
        const mod = valorMod * qtdDiasPagamento;

        Object.assign(data, { arrend, embalagem, mod });
      }

      // RECEITA DE VENDAS MI
      const isMiSallesDate =
        dia >= vendasMiDias && dia < diasProjecao + vendasMiDias;
      if (isMiSallesDate) {
        Object.assign(data, { freteMi, comissaoMi, impostoMi });
      }

      // RECEITA DE VENDAS ME
      const isMeSallesDate =
        dia >= vendasMeDias && dia < diasProjecao + vendasMeDias;
      if (isMeSallesDate) {
        Object.assign(data, { freteRodMe, portoMe, maritMe, financMe });
      }

      Object.assign(data, {
        saidas:
          -data.compraBoi -
          data.freteBoi -
          data.arrend -
          data.embalagem -
          data.mod -
          data.freteMi -
          data.comissaoMi -
          data.impostoMi -
          data.freteRodMe -
          data.portoMe -
          data.maritMe -
          data.financMe,
      });

      saidasAcc += data.saidas * -1;
      Object.assign(data, { saidasAcc });

      // RECEITAS 40
      const isIncomeAdvanceDay = dia <= diasProjecao;
      if (isIncomeAdvanceDay) {
        Object.assign(data, {
          recMe40: incomesMeAntecipated,
        });
      }

      // RECEITAS 60
      if (isMeSallesDate) {
        Object.assign(data, { recMe60: incomesMeReckoning });
      }

      // RECEITAS ME
      Object.assign(data, {
        recMe: data.recMe40 + data.recMe60,
      });

      // RECEITAS MI
      if (isMiSallesDate) {
        Object.assign(data, {
          recMi: totalMiEntries,
        });
      }

      // RECEITA ME e MI
      Object.assign(data, { recTotal: data.recMe + data.recMi });

      recTotalAcc += data.recTotal * 1;
      Object.assign(data, { recTotalAcc });

      // RECEITA - DESP
      Object.assign(data, {
        recTotalWithExpenses: data.recTotal + data.saidas,
      });

      // ACC
      acc += data.recTotalWithExpenses;
      Object.assign(data, { acc });

      // RESPONSE
      response.dailyFlow.push(data);

      // DAY INCREMENT
      dia++;
    }

    // Break Even
    const breakEven = this.getBreakEven(response);
    Object.assign(response, { breakEven });

    // Break Even Final
    const breakEvenFinal = this.getFinalBreakEven(response);
    Object.assign(response, { breakEvenFinal });

    return response;
  }
}
