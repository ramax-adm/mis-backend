import { Injectable, NotFoundException } from '@nestjs/common';
import { CommonDto } from './dtos/common/common.dto';
import { CashFlowService } from './cash-flow.service';
import { InjectRepository } from '@nestjs/typeorm';
import { CashFlowSimulation } from './entities/cash-flow-simulation.entity';
import { Between, FindOptionsWhere, IsNull, Repository } from 'typeorm';
import * as dateFns from 'date-fns';
import { CashFlowChampionCattleService } from './cash-flow-champion-cattle.service';
import { CommonChampionCattleDto } from './dtos/common/champion-cattle/common.dto';
import { CashFlowChampionCattleSimulateResponseInput } from './dtos/cash-flow-champion-cattle-simulate-response.dto';

@Injectable()
export class CashFlowSimulationService {
  constructor(
    private readonly cashFlowService: CashFlowService,
    private readonly cashFlowChampionCattleService: CashFlowChampionCattleService,

    @InjectRepository(CashFlowSimulation)
    private readonly cashFlowSimulationRepository: Repository<CashFlowSimulation>,
  ) {}

  simulate(dto: CommonDto) {
    const productionValues = this.cashFlowService.getProductionValues(dto);
    const productionProjection = this.cashFlowService.projectProduction(dto);
    const entriesProjection = this.cashFlowService.projectEntries(dto);
    const outingsProjection = this.cashFlowService.projectOutings(dto);
    const operationClosureProjection =
      this.cashFlowService.projectOperationClosure(dto);
    const costsByKgProjection = this.cashFlowService.projectCostByKg(dto);
    const dailyFlowProjection = this.cashFlowService.projectDailyFlow(dto);

    return {
      productionValues,
      productionProjection,
      entriesProjection,
      outingsProjection,
      operationClosureProjection,
      costsByKgProjection,
      dailyFlowProjection,
    };
  }

  // simulate champion cattle
  async simulateChampionCattle(dto: CommonChampionCattleDto) {
    console.log({
      dto,
      rendimentosMe: dto.rendimentosMe,
      rendimentosMi: dto.rendimentosMi,
      precosMe: dto.precosMe,
      precosMi: dto.precosMi,
    });

    const {
      me: { ptax },
    } = dto;
    const products = await this.cashFlowChampionCattleService.getProducts();
    const productionValues = this.cashFlowService.getProductionValues({
      ...dto,
      matPrima: {
        cbsMe: dto.matPrima.cbs,
        cbsMi: dto.matPrima.cbs,
        precoArrobaMe: dto.matPrima.precoArroba,
        precoArrobaMi: dto.matPrima.precoArroba,
        diasPagamento: 0,
        diasPagamentoFrete: 0,
        ...dto.matPrima,
      },
      operacao: {
        diasPagamentoProdutos: 0,
        ...dto.operacao,
      },
      me: {
        diasPosicao: 0,
        pAntecipacaoMe: 0,
        vendasMeDias: 0,
        ...dto.me,
      },
      mi: {
        vendasMiDias: 0,
        ...dto.mi,
      },
    });

    const {
      totalEntriesInKg,
      totalDtEntriesInKg,
      totalPaEntriesInKg,
      totalTrEntriesInKg,
    } = this.cashFlowService.getTotalEntries({
      cbs: dto.matPrima.cbs,
      pDt: dto.matPrima.pDt,
      pPa: dto.matPrima.pPa,
      pTr: dto.matPrima.pTr,
      pesoArroba: dto.matPrima.pesoArroba,
    });

    const response: CashFlowChampionCattleSimulateResponseInput = {
      data: [],
      totals: {
        entries: {
          totalDtEntriesInKg,
          totalEntriesInKg,
          totalPaEntriesInKg,
          totalTrEntriesInKg,
        },
        // wip
        production: {
          totalDtProductedInKg:
            productionValues.totalByQuartering.dt.kgProduzidoDt,
          totalPaProductedInKg:
            productionValues.totalByQuartering.pa.kgProduzidoPa,
          totalTrProductedInKg:
            productionValues.totalByQuartering.tr.kgProduzidoTr,
          totalProductedInKg: productionValues.total.kgProduzido,
        },
      },
    };

    for (const product of products) {
      const { priceMe, priceMi } =
        this.cashFlowChampionCattleService.getProductPrice(product, dto);

      const {
        mePercent: productPercentMe,
        miPercent: productPercentMi,
        incomeMe,
        incomeMi,
      } = this.cashFlowChampionCattleService.getProductPercent(product, dto);

      // producao
      const { totalProducao, producaoMe, producaoMi } =
        this.cashFlowChampionCattleService.getProductionByProduct(product, dto);

      // faturamento
      const {
        meFaturamento,
        miFaturamento,
        totalFaturamento,
        meFaturamentoKg,
        miFaturamentoKg,
      } = this.cashFlowChampionCattleService.getProductInbound(product, dto);

      // compraBoi
      const { totalCompra, totalCompraMe, totalCompraMi } =
        this.cashFlowChampionCattleService.getBuyCostsByProduct(product, dto);

      // operacao
      const { totalOperacao, totalOperacaoMe, totalOperacaoMi } =
        this.cashFlowChampionCattleService.getOperationCostsByProduct(
          product,
          dto,
          productionValues,
        );

      // vendaMi
      const { totalVendaMi } =
        this.cashFlowChampionCattleService.getMiSallesCosts(
          product,
          dto,
          productionValues,
        );

      // vendaMe
      const { totalVendaMe } =
        this.cashFlowChampionCattleService.getMeSallesCosts(
          product,
          dto,
          productionValues,
        );

      // resutado
      const { meResultado, meResultadoKg, miResultado, miResultadoKg } =
        this.cashFlowChampionCattleService.getOperationClosure({
          meInbound: meFaturamento,
          miInbound: miFaturamento,
          buyCostsMe: totalCompraMe,
          buyCostsMi: totalCompraMi,
          operationCostsMe: totalOperacaoMe,
          operationCostsMi: totalOperacaoMi,
          meProduction: producaoMe,
          miProduction: producaoMi,
          meSallesCosts: totalVendaMe,
          miSallesCosts: totalVendaMi,
        });

      response.data.push({
        productName: product.name,
        productMarket: product.market,
        productQuarter: product.quarterKey,
        incomeMe,
        incomeMi,
        productPriceMe: priceMe * ptax,
        productPriceMi: priceMi,
        productPercentMe,
        productPercentMi,

        meProduction: producaoMe,
        miProduction: producaoMi,
        production: totalProducao,

        meTotalInbound: meFaturamento,
        meTotalInboundKg: meFaturamentoKg,
        miTotalInbound: miFaturamento,
        miTotalInboundKg: miFaturamentoKg,
        totalInbound: totalFaturamento,

        meBuyCosts: totalCompraMe,
        miBuyCosts: totalCompraMi,
        totalBuyCosts: totalCompra,

        meOperationCosts: totalOperacaoMe,
        miOperationCosts: totalOperacaoMi,
        totalOperationCosts: totalOperacao,
        totalMiSalles: totalVendaMi,
        totalMeSalles: totalVendaMe,

        meTotalCosts: totalCompraMe + totalOperacaoMe + totalVendaMe,
        miTotalCosts: totalCompraMi + totalOperacaoMi + totalVendaMi,
        totalCosts: totalCompra + totalOperacao + totalVendaMi + totalVendaMe,
        finalResultMe: meResultado,
        finalResultMeKg: meResultadoKg,
        finalResultMi: miResultado,
        finalResultMiKg: miResultadoKg,
      });
    }

    return response;
  }

  // find
  async findOne(id: string) {
    const simulation = await this.cashFlowSimulationRepository.findOne({
      where: {
        id,
      },
    });

    if (!simulation) {
      throw new NotFoundException('A simulação nao pode ser encontrada.');
    }

    return simulation;
  }

  async findAll(userId: string, query: { date?: Date }) {
    const { date } = query;

    const where: FindOptionsWhere<CashFlowSimulation> = {
      createdById: userId,
      deletedAt: IsNull(),
    };

    if (date) {
      const startOfDay = dateFns.startOfDay(query?.date);
      const endOfDay = dateFns.endOfDay(query?.date);

      Object.assign(where, { createdAt: Between(startOfDay, endOfDay) });
    }

    return await this.cashFlowSimulationRepository.find({
      where,
      relations: { createdBy: true },
    });
  }

  // save
  async save(userId: string, dto: CommonDto) {
    const simulationResults = this.simulate(dto);

    await this.cashFlowSimulationRepository.save({
      requestDto: dto,
      results: simulationResults,
      createdById: userId,
    });
  }

  // delete
  async delete(userId: string, id: string) {
    await this.cashFlowSimulationRepository.update(
      { id },
      {
        deletedById: userId,
        deletedAt: new Date(),
      },
    );
  }

  // delete many
  async deleteMany(userId: string, date: Date) {
    const startOfDay = dateFns.startOfDay(date);
    const endOfDay = dateFns.endOfDay(date);
    await this.cashFlowSimulationRepository.update(
      { createdById: userId, createdAt: Between(startOfDay, endOfDay) },
      {
        deletedById: userId,
        deletedAt: new Date(),
      },
    );
  }
}
