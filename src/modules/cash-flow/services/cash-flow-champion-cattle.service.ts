import { Injectable } from '@nestjs/common';
import { CashFlowProduct } from '../entities/cash-flow-product.entity';
import { CommonChampionCattleDto } from '../dtos/common/champion-cattle/common.dto';
import { CashFlowService } from './cash-flow.service';
import { MarketEnum } from '@/core/enums/sensatta/markets.enum';
import { GetProductionValuesResponseDto } from '../dtos/get-production-values-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StringUtils } from '../../utils/services/string.utils';
import { NumberUtils } from '../../utils/services/number.utils';
import { MeIncomeControlsDto } from '../dtos/controls/me-income-controls.dto';
import { MiIncomeControlsDto } from '../dtos/controls/mi-income-controls.dto';
import { MePricesControlsDto } from '../dtos/controls/me-prices-controls.dto';
import { MiPricesControlsDto } from '../dtos/controls/mi-prices-controls.dto';

const CATTLE_TR_COEFFICIENT = 1.189547;
const CATTLE_DT_COEFFICIENT = 0.831911;
const CATTLE_PA_COEFFICIENT = 0.831911;

@Injectable()
export class CashFlowChampionCattleService {
  constructor(
    @InjectRepository(CashFlowProduct)
    private readonly cashFlowProductRepository: Repository<CashFlowProduct>,
    private readonly cashFlowService: CashFlowService,
  ) {}

  getProducts() {
    return this.cashFlowProductRepository.find();
  }

  // aux
  getProductIncome(
    product: CashFlowProduct,
    dto: {
      rendimentosMe: MeIncomeControlsDto;
      rendimentosMi: MiIncomeControlsDto;
    },
  ) {
    const { rendimentosMe, rendimentosMi } = dto;

    const productMarket = product.market;

    let incomeMi = 0;
    let incomeMe = 0;

    switch (productMarket) {
      case 'both': {
        incomeMe = rendimentosMe[product.quarterKey][product.incomeKey];
        incomeMi = rendimentosMi[product.quarterKey][product.incomeKey];
        break;
      }
      case MarketEnum.ME: {
        incomeMe = rendimentosMe[product.quarterKey][product.incomeKey];
        break;
      }
      case MarketEnum.MI: {
        incomeMi = rendimentosMi[product.quarterKey][product.incomeKey];
        break;
      }
      default: {
        break;
      }
    }

    return { incomeMe, incomeMi };
  }

  getProductPrice(
    product: CashFlowProduct,
    dto: {
      precosMe: MePricesControlsDto;
      precosMi: MiPricesControlsDto;
    },
  ) {
    const { precosMe, precosMi } = dto;

    const productMarket = product.market;

    let priceMi = 0;
    let priceMe = 0;

    switch (productMarket) {
      case 'both': {
        priceMe = precosMe[product.quarterKey][product.incomeKey];
        priceMi = precosMi[product.quarterKey][product.incomeKey];
        break;
      }
      case MarketEnum.ME: {
        priceMe = precosMe[product.quarterKey][product.incomeKey];
        break;
      }
      case MarketEnum.MI: {
        priceMi = precosMi[product.quarterKey][product.incomeKey];
        break;
      }
      default: {
        break;
      }
    }

    return { priceMe, priceMi };
  }

  getProductPercent(product: CashFlowProduct, dto: CommonChampionCattleDto) {
    const {
      matPrima: { pDt, pPa, pTr },
      rendimentosMe,
      rendimentosMi,
    } = dto;

    const { incomeMe, incomeMi } = this.getProductIncome(product, {
      rendimentosMe,
      rendimentosMi,
    });

    const map = new Map();
    map.set('dt', pDt);
    map.set('pa', pPa);
    map.set('tr', pTr);

    // % ME
    // % MI

    return {
      mePercent: NumberUtils.nb4(incomeMe * map.get(product.quarterKey)),
      miPercent: NumberUtils.nb4(incomeMi * map.get(product.quarterKey)),
      incomeMe,
      incomeMi,
    };
  }

  getProductBuyCoefficient(product: CashFlowProduct) {
    let coefficient = 0;

    if (product.quarterKey === 'dt') {
      coefficient = CATTLE_DT_COEFFICIENT;
    } else if (product.quarterKey === 'pa') {
      coefficient = CATTLE_PA_COEFFICIENT;
    } else if (product.quarterKey === 'tr') {
      coefficient = CATTLE_TR_COEFFICIENT;
    }

    return coefficient;
  }

  // getProductionValues(
  //   dto: CommonChampionCattleDto,
  // ): GetProductionValuesResponseDto {
  //   const { cbs, pDt, pPa, pTr, pesoArroba } = dto.matPrima;

  //   // Entradas ME
  //   const { totalDtEntriesInKg, totalPaEntriesInKg, totalTrEntriesInKg } =
  //     this.cashFlowService.getTotalEntries({
  //       cbs,
  //       pesoArroba,
  //       pDt,
  //       pPa,
  //       pTr,
  //     });

  //   const { rendimentosMe, rendimentosMi } = dto;

  //   // Rendimentos ME
  //   const {
  //     totalDtIncome: totalMeDtIncome,
  //     totalPaIncome: totalMePaIncome,
  //     totalTrIncome: totalMeTrIncome,
  //   } = this.cashFlowService.getMeTotalIncomes(rendimentosMe);

  //   // KG produzido ME
  //   const {
  //     totalDtProductedInKg: totalMeDtProductedInKg,
  //     totalPaProductedInKg: totalMePaProductedInKg,
  //     totalTrProductedInKg: totalMeTrProductedInKg,
  //   } = this.cashFlowService.getProductedMeEntry({
  //     totalMeDtEntriesInKg: totalDtEntriesInKg,
  //     totalMeTrEntriesInKg: totalTrEntriesInKg,
  //     totalMePaEntriesInKg: totalPaEntriesInKg,
  //     totalMeDtIncome,
  //     totalMeTrIncome,
  //     totalMePaIncome,
  //   });

  //   // Entradas MI
  //   // Rendimento MI
  //   const {
  //     totalDtIncome: totalMiDtIncome,
  //     totalPaIncome: totalMiPaIncome,
  //     totalTrIncome: totalMiTrIncome,
  //   } = this.cashFlowService.getMiTotalIncomes(rendimentosMi);

  //   // KG produzido MI
  //   const {
  //     totalDtProductedInKg: totalMiDtProductedInKg,
  //     totalPaProductedInKg: totalMiPaProductedInKg,
  //     totalTrProductedInKg: totalMiTrProductedInKg,
  //   } = this.cashFlowService.getProductedMiEntry({
  //     totalMiDtEntriesInKg: totalDtEntriesInKg,
  //     totalMiTrEntriesInKg: totalTrEntriesInKg,
  //     totalMiPaEntriesInKg: totalPaEntriesInKg,
  //     totalMiDtIncome,
  //     totalMiTrIncome,
  //     totalMiPaIncome,
  //   });

  //   // Response
  //   const meResponse = {
  //     dt: {
  //       entradaDt: totalDtEntriesInKg,
  //       kgRendimentoDt: totalMeDtProductedInKg,
  //       pRendimentoDt: NumberUtils.nb4(totalMeDtIncome),
  //     },
  //     pa: {
  //       entradaPa: totalPaEntriesInKg,
  //       kgRendimentoPa: totalMePaProductedInKg,
  //       pRendimentoPa: NumberUtils.nb4(totalMePaIncome),
  //     },
  //     tr: {
  //       entradaTr: totalTrEntriesInKg,
  //       kgRendimentoTr: totalMeTrProductedInKg,
  //       pRendimentoTr: NumberUtils.nb4(totalMeTrIncome),
  //     },
  //   };
  //   const miResponse = {
  //     dt: {
  //       entradaDt: totalDtEntriesInKg,
  //       kgRendimentoDt: totalMiDtProductedInKg,
  //       pRendimentoDt: NumberUtils.nb4(totalMiDtIncome),
  //     },
  //     pa: {
  //       entradaPa: totalPaEntriesInKg,
  //       kgRendimentoPa: totalMiPaProductedInKg,
  //       pRendimentoPa: NumberUtils.nb4(totalMiPaIncome),
  //     },
  //     tr: {
  //       entradaTr: totalTrEntriesInKg,
  //       kgRendimentoTr: totalMiTrProductedInKg,
  //       pRendimentoTr: NumberUtils.nb4(totalMiTrIncome),
  //     },
  //   };

  //   // Total por quarteio

  //   const kgRendimentoDtTotal =
  //     miResponse.dt.kgRendimentoDt + meResponse.dt.kgRendimentoDt;
  //   const kgRendimentoPaTotal =
  //     miResponse.pa.kgRendimentoPa + meResponse.pa.kgRendimentoPa;
  //   const kgRendimentoTrTotal =
  //     miResponse.tr.kgRendimentoTr + meResponse.tr.kgRendimentoTr;
  //   const totalByQuartering = {
  //     dt: {
  //       entradaDt: totalDtEntriesInKg,
  //       kgProduzidoDt: kgRendimentoDtTotal,
  //       pRendimentoDt: NumberUtils.nb4(
  //         kgRendimentoDtTotal / totalDtEntriesInKg,
  //       ),
  //     },
  //     pa: {
  //       entradaPa: totalPaEntriesInKg,
  //       kgProduzidoPa: kgRendimentoPaTotal,
  //       pRendimentoPa: NumberUtils.nb4(
  //         kgRendimentoPaTotal / totalPaEntriesInKg,
  //       ),
  //     },
  //     tr: {
  //       entradaTr: totalTrEntriesInKg,
  //       kgProduzidoTr: kgRendimentoTrTotal,
  //       pRendimentoTr: NumberUtils.nb4(
  //         kgRendimentoTrTotal / totalTrEntriesInKg,
  //       ),
  //     },
  //   };

  //   const kgEntradaMiTotal =
  //     miResponse.dt.entradaDt +
  //     miResponse.tr.entradaTr +
  //     miResponse.pa.entradaPa;
  //   const kgProduzidoMiTotal =
  //     miResponse.dt.kgRendimentoDt +
  //     miResponse.tr.kgRendimentoTr +
  //     miResponse.pa.kgRendimentoPa;

  //   const kgEntradaMeTotal =
  //     meResponse.dt.entradaDt +
  //     meResponse.tr.entradaTr +
  //     meResponse.pa.entradaPa;
  //   const kgProduzidoMeTotal =
  //     meResponse.dt.kgRendimentoDt +
  //     meResponse.tr.kgRendimentoTr +
  //     meResponse.pa.kgRendimentoPa;

  //   const kgEntradaTotal =
  //     totalByQuartering.dt.entradaDt +
  //     totalByQuartering.tr.entradaTr +
  //     totalByQuartering.pa.entradaPa;
  //   const kgProduzidoTotal =
  //     totalByQuartering.dt.kgProduzidoDt +
  //     totalByQuartering.pa.kgProduzidoPa +
  //     totalByQuartering.tr.kgProduzidoTr;
  //   const total = {
  //     // MI
  //     kgEntradaMi: kgEntradaMiTotal,
  //     kgProduzidoMi: kgProduzidoMiTotal,
  //     pRendimentoMi: NumberUtils.nb4(kgProduzidoMiTotal / kgEntradaMiTotal),
  //     // ME
  //     kgEntradaMe: kgEntradaMeTotal,
  //     kgProduzidoMe: kgProduzidoMeTotal,
  //     pRendimentoMe: NumberUtils.nb4(kgProduzidoMeTotal / kgEntradaMeTotal),

  //     kgEntrada: kgEntradaTotal,
  //     kgProduzido: kgProduzidoTotal,
  //     pRendimento: NumberUtils.nb4(kgProduzidoTotal / kgEntradaTotal),
  //   };
  //   return {
  //     me: meResponse,
  //     mi: miResponse,
  //     totalByQuartering,
  //     total,
  //   };
  // }

  // PRODUCAO - OK
  /**
   * 1.
   * Com base nos controles CBS ME, CBS MI, PESO @ de cada cb e transformando
   * o peso em KG (*15) podemos ter o total de KG de entrada
   *
   * 2.
   * Com base no total da entrada, pegamos a % que representa o quarteio do produto
   * (DT,PA ou TR) e temos o peso de entrada do quarteio
   *
   * 3.
   * Com base na entrada do quarteio, pegamos a % rendimento do produto passado via controle
   * e determinamos quantos kg de producao aquele produto teve.
   */
  getProductionByProduct(
    product: CashFlowProduct,
    dto: CommonChampionCattleDto,
  ) {
    const {
      matPrima: { cbs, pDt, pPa, pTr, pesoArroba },
    } = dto;

    const { mePercent, miPercent } = this.getProductPercent(product, dto);

    // Entradas brutas
    const { totalEntriesInKg } = this.cashFlowService.getTotalEntries({
      cbs,
      pesoArroba,
      pDt,
      pPa,
      pTr,
    });

    const producaoMe = totalEntriesInKg * mePercent;
    const producaoMi = totalEntriesInKg * miPercent;

    const totalProducao = producaoMe + producaoMi;

    if (StringUtils.ILike('%Costela%', product.name)) {
      console.log('Production', {
        totalEntriesInKg,
        mePercent,
        miPercent,
        totalProducao,
        producaoMe,
        producaoMi,
        product,
      });
    }

    return {
      producaoMe,
      producaoMi,
      totalProducao,
    };
  }

  // FATURAMENTO - OK
  getProductInbound(product: CashFlowProduct, dto: CommonChampionCattleDto) {
    const {
      me: { ptax },
      precosMe,
      precosMi,
    } = dto;

    const { priceMe: precoMe, priceMi: precoMi } = this.getProductPrice(
      product,
      {
        precosMe,
        precosMi,
      },
    );

    const { producaoMe, producaoMi } = this.getProductionByProduct(
      product,
      dto,
    );

    let meFaturamento = 0;
    let miFaturamento = 0;
    let meFaturamentoKg = 0;
    let miFaturamentoKg = 0;

    const market = product.market;
    if (market === MarketEnum.ME || market === 'both') {
      meFaturamento = NumberUtils.nb2(producaoMe * precoMe * ptax);
      meFaturamentoKg = meFaturamento / producaoMe;
    }

    if (market === MarketEnum.MI || market === 'both') {
      miFaturamento = NumberUtils.nb2(producaoMi * precoMi);
      miFaturamentoKg = miFaturamento / producaoMi;
    }

    const totalFaturamento = NumberUtils.nb2(meFaturamento + miFaturamento);

    return {
      meFaturamento,
      miFaturamento,
      totalFaturamento,
      meFaturamentoKg,
      miFaturamentoKg,
    };
  }

  // COMPRA - OK
  /**
   * 1.
   * com base nos controles cbs, pesoArroba,precoArroba (para os mercados)
   * determinar o valor de gasto com a compra de animais
   *
   * 2.
   * com o preço de compra dos animais, determinar % desse custo diz respeito ao corte
   * = preço compra * % quarteio * % rendimento carne
   *
   */
  getBuyCostsByProduct(product: CashFlowProduct, dto: CommonChampionCattleDto) {
    const {
      matPrima: { cbs, pesoArroba, precoFreteKg, precoArroba },
    } = dto;

    const { mePercent: productMePercent, miPercent: productMiPercent } =
      this.getProductPercent(product, dto);

    const coefficient = this.getProductBuyCoefficient(product);

    const valorCompraCabecasMi =
      cbs * pesoArroba * precoArroba * productMiPercent;
    const valorCompraCabecasMe =
      cbs * pesoArroba * precoArroba * productMePercent;
    const valorFreteCabecasMi =
      cbs * pesoArroba * 15 * precoFreteKg * productMiPercent;
    const valorFreteCabecasMe =
      cbs * pesoArroba * 15 * precoFreteKg * productMePercent;

    const totalCompraMe =
      (valorCompraCabecasMe + valorFreteCabecasMe) * coefficient;
    const totalCompraMi =
      (valorCompraCabecasMi + valorFreteCabecasMi) * coefficient;
    const totalCompra = NumberUtils.nb2(
      (totalCompraMe + totalCompraMi) * coefficient,
    );

    if (StringUtils.ILike('%Acém%', product.name)) {
      console.log('Buy Costs', {
        productMePercent,
        productMiPercent,
        totalCompra,
        product,
        valorCompraCabecasMi,
        valorCompraCabecasMe,
        valorFreteCabecasMi,
        valorFreteCabecasMe,
      });
    }

    return {
      totalCompraMe,
      totalCompraMi,
      totalCompra,
    };
  }

  // DESPESAS - OK
  getOperationCostsByProduct(
    product: CashFlowProduct,
    dto: CommonChampionCattleDto,
    productionValues: GetProductionValuesResponseDto,
  ) {
    const {
      operacao: { precoEmbalagem, precoMod, tipoArrend, arredKg },
    } = dto;

    const {
      total: { kgEntradaMe, kgEntradaMi },
    } = productionValues;

    const { mePercent: productMePercent, miPercent: productMiPercent } =
      this.getProductPercent(product, dto);

    // operacao expenses
    let valorArrendMe = 0;
    let valorArrendMi = 0;
    let embalagemMe = 0;
    let embalagemMi = 0;
    let modMe = 0;
    let modMi = 0;

    const productMarket = product.market;
    if (productMarket === MarketEnum.ME || productMarket === 'both') {
      const arredMeWeight = this.cashFlowService.getArrendWeight(
        tipoArrend,
        kgEntradaMe,
        kgEntradaMe * productMePercent,
      );
      valorArrendMe = arredMeWeight * arredKg * productMePercent;
      embalagemMe = kgEntradaMe * precoEmbalagem * productMePercent;
      modMe = kgEntradaMe * precoMod * productMePercent;
    }
    if (productMarket === MarketEnum.MI || productMarket === 'both') {
      const arredMiWeight = this.cashFlowService.getArrendWeight(
        tipoArrend,
        kgEntradaMi,
        kgEntradaMi * productMiPercent,
      );

      valorArrendMi = arredMiWeight * arredKg * productMiPercent;
      embalagemMi = kgEntradaMi * precoEmbalagem * productMiPercent;
      modMi = kgEntradaMi * precoMod * productMiPercent;
    }

    const valorArrend = valorArrendMe + valorArrendMi;
    const embalagem = embalagemMe + embalagemMi;
    const mod = modMe + modMi;

    const totalOperacao = valorArrend + embalagem + mod;
    const totalOperacaoMe = valorArrendMe + embalagemMe + modMe;
    const totalOperacaoMi = valorArrendMi + embalagemMi + modMi;

    if (StringUtils.ILike('%Acém%', product.name)) {
      console.log('OP Costs', {
        productMePercent,
        productMiPercent,
        valorArrendMe,
        valorArrendMi,
        embalagemMe,
        embalagemMi,
        modMe,
        modMi,
        kgEntradaMe,
        kgEntradaMi,
        product,
      });
    }

    return {
      valorArrend,
      embalagem,
      mod,
      totalOperacao,
      totalOperacaoMe,
      totalOperacaoMi,
    };
  }

  // CUSTOS VENDA MI - OK
  getMiSallesCosts(
    product: CashFlowProduct,
    dto: CommonChampionCattleDto,
    productionValues: GetProductionValuesResponseDto,
  ) {
    const {
      mi: { pComissoesMi, pImpostosMi, precoFreteMi },
    } = dto;

    const {
      total: { kgEntradaMi },
    } = productionValues;

    const { miPercent: productMiPercent } = this.getProductPercent(
      product,
      dto,
    );

    const productMarket = product.market;

    const response = {
      freteVenda: 0,
      comissao: 0,
      imposto: 0,
      totalVendaMi: 0,
    };
    if (productMarket === MarketEnum.ME) {
      return response;
    }

    //Faturamento
    const { miFaturamento } = this.getProductInbound(product, dto);

    const freteVenda = kgEntradaMi * productMiPercent * precoFreteMi;
    const comissao = miFaturamento * pComissoesMi;
    const imposto = miFaturamento * pImpostosMi;

    Object.assign(response, {
      freteVenda,
      comissao,
      imposto,
      totalVendaMi: freteVenda + comissao + imposto,
    });

    if (StringUtils.ILike('%Acém%', product.name)) {
      console.log('MI SALLES Costs', {
        ...response,
        product,
      });
    }
    return response;
  }

  // CUSTOS VENDA ME - OK
  getMeSallesCosts(
    product: CashFlowProduct,
    dto: CommonChampionCattleDto,
    productionValues: GetProductionValuesResponseDto,
  ) {
    const {
      me: { precoFinanc, precoFreteInter, precoFreteRodoviario, precoPorto },
    } = dto;

    const {
      total: { kgEntradaMe },
    } = productionValues;

    const { mePercent: productMePercent } = this.getProductPercent(
      product,
      dto,
    );

    const productMarket = product.market;

    const response = {
      rodov: 0,
      porto: 0,
      marit: 0,
      financ: 0,
      totalVendaMe: 0,
    };
    if (productMarket === MarketEnum.MI) {
      return response;
    }

    const rodov = kgEntradaMe * productMePercent * precoFreteRodoviario;
    const porto = kgEntradaMe * productMePercent * precoPorto;
    const marit = kgEntradaMe * productMePercent * precoFreteInter;
    const financ = kgEntradaMe * productMePercent * precoFinanc;

    Object.assign(response, {
      rodov,
      porto,
      marit,
      financ,
      totalVendaMe: rodov + porto + marit + financ,
    });

    if (StringUtils.ILike('%Acém%', product.name)) {
      console.log('ME SALLES Costs', {
        ...response,
        product,
      });
    }
    return response;
  }

  // RESULTADO! - OK
  getOperationClosure(dto: {
    meProduction: number;
    miProduction: number;
    meInbound: number;
    miInbound: number;
    buyCostsMe: number;
    buyCostsMi: number;
    operationCostsMe: number;
    operationCostsMi: number;
    miSallesCosts: number;
    meSallesCosts: number;
  }) {
    const {
      buyCostsMe,
      buyCostsMi,
      meInbound,
      meProduction,
      meSallesCosts,
      miInbound,
      miProduction,
      miSallesCosts,
      operationCostsMe,
      operationCostsMi,
    } = dto;

    const meResultado =
      meInbound - (buyCostsMe + meSallesCosts + operationCostsMe);

    const miResultado =
      miInbound - (buyCostsMi + miSallesCosts + operationCostsMi);

    const meResultadoKg = NumberUtils.nb2(meResultado / meProduction);
    const miResultadoKg = NumberUtils.nb2(miResultado / miProduction);

    return { meResultado, miResultado, meResultadoKg, miResultadoKg };
  }
}
