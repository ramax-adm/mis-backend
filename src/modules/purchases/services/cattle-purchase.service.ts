import { Injectable } from '@nestjs/common';
import {
  Between,
  DataSource,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { GetCattlePurchaseLastUpdatedAtResponseDto } from '../dtos/get-cattle-purchase-last-updated-at-response.dto';
import { CattlePurchase } from '@/modules/purchases/entities/cattle-purchase.entity';
import { GetAnalyticalCattlePurchaseResponseDto } from '../dtos/get-analytical-cattle-purchase-response.dto';
import {
  CattlePurchaseKpis,
  CattlePurchaseTotals,
  GetCattlePurchase,
  GetCattlePurchaseRaw,
} from '../types/get-cattle-purchase.type';

@Injectable()
export class CattlePurchaseService {
  constructor(private readonly dataSource: DataSource) {}

  async getCattlePurchaseLastUpdatedAt() {
    const [purchase] = await this.dataSource.manager.find(CattlePurchase, {
      take: 1,
    });

    // Toda vez que eu atualizo os dados (dou carga novamente) o dado é recriado
    return {
      updatedAt: purchase.createdAt,
    } as GetCattlePurchaseLastUpdatedAtResponseDto;
  }

  async getData({
    companyCodes,
    cattleAdvisorName = '',
    cattleOwnerName = '',
    cattleClassification = '',
    purchaseCattleOrderId = '',
    startDate,
    endDate,
  }: {
    companyCodes: string[];
    cattleOwnerName?: string;
    cattleAdvisorName?: string;
    cattleClassification?: string;
    purchaseCattleOrderId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<GetCattlePurchase[]> {
    const qb = this.dataSource
      .getRepository(CattlePurchase)
      .createQueryBuilder('scp')
      .select([
        'scp',
        `(scp.total_value / NULLIF(scp.cattle_quantity, 0)) AS head_price`,
        `((scp.total_value / NULLIF(scp.cattle_quantity, 0)) / NULLIF(scp.cattle_weight_in_arroba, 0)) AS arroba_price`,
        `(((scp.total_value / NULLIF(scp.cattle_quantity, 0)) / NULLIF(scp.cattle_weight_in_arroba, 0)) / 15) AS kg_price`,
      ])
      .leftJoinAndSelect(
        'sensatta_companies',
        'sc',
        'sc.sensatta_code = scp.companyCode',
      )
      .where('1=1')
      .andWhere('scp.companyCode IN (:...companyCodes)', { companyCodes });

    // ---------------------------
    // FILTROS DINÂMICOS
    // ---------------------------
    if (cattleOwnerName?.length) {
      qb.andWhere('scp.cattleOwnerName ILIKE :owner', {
        owner: `%${cattleOwnerName}%`,
      });
    }

    if (cattleAdvisorName?.length) {
      qb.andWhere('scp.cattleAdvisorName ILIKE :advisor', {
        advisor: `%${cattleAdvisorName}%`,
      });
    }

    if (cattleClassification?.length) {
      qb.andWhere('scp.cattleClassification ILIKE :classification', {
        classification: `%${cattleClassification}%`,
      });
    }

    if (purchaseCattleOrderId?.length) {
      qb.andWhere('scp.sensattaId ILIKE :purchaseCattleOrderId', {
        purchaseCattleOrderId: `%${purchaseCattleOrderId}%`,
      });
    }

    if (startDate && endDate) {
      qb.andWhere('scp.slaughterDate BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
    } else if (startDate) {
      qb.andWhere('scp.slaughterDate >= :start', {
        start: startDate,
      });
    } else if (endDate) {
      qb.andWhere('scp.slaughterDate <= :end', {
        end: endDate,
      });
    }

    qb.orderBy('scp.slaughterDate', 'ASC');

    // 👇 Mantém exatamente o mesmo retorno do find anterior
    const result = await qb.getRawMany<GetCattlePurchaseRaw>();

    return result.map((i) => {
      const cattleWeightInArroba =
        i.scp_cattle_weight_in_arroba * i.scp_cattle_quantity;

      const cattleWeightInKg =
        i.scp_cattle_weight_in_kg * i.scp_cattle_quantity;

      return {
        id: i.scp_id,
        sensattaId: i.scp_sensatta_id,
        slaughterDate: i.scp_slaughter_date,
        balanceWeightInKg: i.scp_balance_weight_in_kg,
        cattleAdvisorCode: i.scp_cattle_advisor_code,
        cattleAdvisorName: i.scp_cattle_advisor_name,
        cattleClassification: i.scp_cattle_classification,
        cattleOwnerCode: i.scp_cattle_owner_code,
        cattleOwnerName: i.scp_cattle_owner_name,
        cattleQuantity: i.scp_cattle_quantity,
        cattleWeightInArroba,
        cattleWeightInKg,
        commissionPrice: i.scp_commission_price,
        companyCode: i.sc_sensatta_code,
        companyName: i.sc_name,
        createdAt: i.scp_created_at,
        freightPrice: i.scp_freight_price,
        funruralPrice: i.scp_funrural_price,
        headPrice: i.scp_total_value / i.scp_cattle_quantity,
        arrobaPrice: i.scp_total_value / cattleWeightInArroba,
        kgPrice: i.scp_total_value / cattleWeightInArroba / 15,
        paymentTerm: i.scp_payment_term_in_days,
        purchaseLiquidPrice: i.scp_purchase_liquid_price,
        purchasePrice: i.scp_purchase_price,
        totalValue: i.scp_total_value,
        weighingType: i.scp_weighing_type,
      };
    });
  }

  async getAnalyticalData({
    companyCodes,
    cattleAdvisorName = '',
    cattleOwnerName = '',
    cattleClassification = '',
    purchaseCattleOrderId = '',
    startDate,
    endDate,
  }: {
    companyCodes: string[];
    cattleOwnerName?: string;
    cattleAdvisorName?: string;
    cattleClassification?: string;
    purchaseCattleOrderId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const data = await this.getData({
      companyCodes,
      cattleAdvisorName,
      cattleClassification,
      cattleOwnerName,
      purchaseCattleOrderId,
      endDate,
      startDate,
    });

    const response = data.map(
      (item) => new GetAnalyticalCattlePurchaseResponseDto(item),
    );

    return response;
  }

  async getAggregatedAnalyticalData({
    companyCodes,
    cattleAdvisorName,
    cattleClassification,
    cattleOwnerName,
    purchaseCattleOrderId,
    endDate,
    startDate,
  }: {
    companyCodes: string[];
    cattleOwnerName?: string;
    cattleAdvisorName?: string;
    cattleClassification?: string;
    purchaseCattleOrderId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const entityKey = 'sensattaId' as keyof CattlePurchase;
    const data = await this.getData({
      companyCodes,
      cattleAdvisorName,
      cattleClassification,
      cattleOwnerName,
      purchaseCattleOrderId,
      endDate,
      startDate,
    });

    const map = new Map<
      string,
      {
        slaughterDate: Date;
        cattleOwnerCode: string;
        cattleOwnerName: string;
        companyCode: string;
        companyName: string;
        cattleAdvisorCode: string;
        cattleAdvisorName: string;
        weightInArroba: number;
        weightInKg: number;
        cattleQuantity: number;
        freightPrice: number;
        purchasePrice: number;
        commissionPrice: number;
        totalValue: number;
        arrobaPrice: number;
        headPrice: number;
        kgPrice: number;
        count: number;
      }
    >();

    for (const item of data) {
      const key = item[entityKey] as string;
      const group = {
        slaughterDate: item.slaughterDate,
        cattleOwnerCode: item.cattleOwnerCode,
        cattleOwnerName: item.cattleOwnerName,
        companyCode: item.companyCode,
        companyName: item.companyName,
        cattleAdvisorCode: item.cattleAdvisorCode,
        cattleAdvisorName: item.cattleAdvisorName,
        weightInArroba: item.cattleWeightInArroba,
        weightInKg: item.cattleWeightInKg,
        cattleQuantity: item.cattleQuantity,
        freightPrice: item.freightPrice,
        purchasePrice: item.purchasePrice,
        commissionPrice: item.commissionPrice,
        totalValue: item.totalValue,
        headPrice: 0,
        arrobaPrice: 0,
        kgPrice: 0,
        count: 1,
      };

      if (!map.has(key)) {
        map.set(key, group);
        continue;
      }

      const previousMap = map.get(key)!;
      previousMap.weightInArroba += item.cattleWeightInArroba;
      previousMap.weightInKg += item.cattleWeightInKg;
      previousMap.cattleQuantity += item.cattleQuantity;
      previousMap.freightPrice += item.freightPrice;
      previousMap.purchasePrice += item.purchasePrice;
      previousMap.commissionPrice += item.commissionPrice;
      previousMap.totalValue += item.totalValue;

      previousMap.count += 1;
    }

    for (const [, obj] of map) {
      obj.headPrice += obj.totalValue / obj.cattleQuantity;
      obj.arrobaPrice += obj.totalValue / obj.weightInArroba;
      obj.kgPrice += obj.totalValue / obj.weightInArroba / 15;
    }
    return Object.fromEntries(map);
  }

  /**
   * [08:11, 02/07/2025] Francisco Finpec: monta o dash com gráfico de pizza por assessor.. com %... tipo o da horas extras
   * [08:12, 02/07/2025] Francisco Finpec: grafico de tempo com qtdde  de cabeças compradas
   * [08:13, 02/07/2025] Francisco Finpec: tabela com assessor qtdd total de cabeças / qtdd $frete / qtdd $ comissão / qtdd $ compra
   * tabela com pecuarista;
   */
  async getResumeData({
    companyCodes,
    endDate,
    startDate,
    cattleAdvisorName,
    cattleClassification,
    cattleOwnerName,
  }: {
    companyCodes: string[];
    startDate?: Date;
    endDate?: Date;
    cattleOwnerName?: string;
    cattleAdvisorName?: string;
    cattleClassification?: string;
  }) {
    const data = await this.getData({
      companyCodes,
      endDate,
      startDate,
      cattleAdvisorName,
      cattleClassification,
      cattleOwnerName,
    });

    // custo un por cabeça
    // frete gasto % sobre o total da compra
    // comissão paga % sobre o total da compra
    const totals: CattlePurchaseTotals = {
      weightInArroba: 0,
      weightInKg: 0,
      cattleQuantity: 0,
      freightValue: 0,
      purchaseValue: 0,
      commissionValue: 0,
      finalValue: 0,
      headPrice: 0,
      arrobaPrice: 0,
      count: 0,
      kgPrice: 0,
    };

    /** KPIs */
    // custo un por cabeça
    // frete gasto % sobre o total da compra
    // comissão paga % sobre o total da compra
    const kpis: CattlePurchaseKpis = {
      headPrice: 0,
      arrobaPrice: 0,
      kgPrice: 0,
      priceDeviation: 0,
      freightPercentOverTotal: 0,
      commissionPercentOverTotal: 0,
    };

    /** BLOCO 1 - CIMA */
    // por empresa
    const cattlePurchaseByCompanyMap = new Map<
      string,
      {
        companyCode: string;
        companyName: string;
        cattleQuantity: number;
        totalValue: number;
        percent?: number;
      }
    >();

    // qtd de cabeças p/ dia - OK
    const cattlePurchaseQuantityBySlaughterDateMap: Map<string, number> =
      new Map();

    /** BLOCO 2 - baixo */
    // por classificação de gado
    /**
     * classificacao
     * med R$ p/ cabeça
     * med R$/@
     * med R$/KG
     * $ compra
     * $ frete
     * $ comissao
     * $ total
     * % total
     */
    const cattlePurchaseByCattleClassificationMap = new Map<
      string,
      {
        cattleQuantity: number;
        freightPrice: number;
        purchasePrice: number;
        commissionPrice: number;
        totalValue: number;
        percent?: number;
      }
    >();

    // por acessor - OK
    const cattlePurchaseByCattleAdvisorMap: Map<
      string,
      {
        cattleQuantity: number;
        freightPrice: number;
        purchasePrice: number;
        commissionPrice: number;
        totalValue: number;
        percent?: number;
      }
    > = new Map();
    const cattlePurchaseByCattleAdvisor: {
      cattleAdvisorCode: string;
      cattleAdvisorName: string;
      cattleQuantity: number;
      freightPrice: number;
      purchasePrice: number;
      commissionPrice: number;
      totalValue: number;
      percent?: number;
    }[] = [];

    // por pecuarista - OK
    const cattlePurchaseByCattleOwnerMap: Map<
      string,
      {
        cattleQuantity: number;
        freightPrice: number;
        purchasePrice: number;
        commissionPrice: number;
        totalValue: number;
        percent?: number;
      }
    > = new Map();
    const cattlePurchaseByCattleOwner: {
      cattleOwnerCode: string;
      cattleOwnerName: string;
      cattleQuantity: number;
      freightPrice: number;
      purchasePrice: number;
      commissionPrice: number;
      totalValue: number;
      percent?: number;
    }[] = [];

    for (const item of data) {
      const dateKey = new Date(item.slaughterDate).toISOString();
      const companyName = item.companyName;
      const cattleAdvisorKey = `${item.cattleAdvisorCode} - ${item.cattleAdvisorName}`;
      const cattleOwnerKey = `${item.cattleOwnerCode} - ${item.cattleOwnerName}`;
      const cattleClassificationKey = item.cattleClassification;

      const cattleQuantity = item.cattleQuantity;
      const commissionPrice = item.commissionPrice;
      const freightPrice = item.freightPrice;
      const purchasePrice = item.purchasePrice;
      const totalValue = item.totalValue;

      if (!cattlePurchaseByCompanyMap.has(companyName)) {
        const group = {
          companyCode: item.companyCode,
          companyName: item.companyName,
          cattleQuantity: 0,
          totalValue: 0,
          percent: 0,
        };
        cattlePurchaseByCompanyMap.set(companyName, group);
      }
      const cattlePurchaseByCompanyGroup =
        cattlePurchaseByCompanyMap.get(companyName)!;
      cattlePurchaseByCompanyGroup.cattleQuantity += item.cattleQuantity;
      cattlePurchaseByCompanyGroup.totalValue += item.totalValue;

      if (!cattlePurchaseQuantityBySlaughterDateMap.has(dateKey)) {
        cattlePurchaseQuantityBySlaughterDateMap.set(dateKey, 0);
      }
      const cattlePurchaseBySlaughterDateGroup =
        cattlePurchaseQuantityBySlaughterDateMap.get(dateKey)!;
      cattlePurchaseQuantityBySlaughterDateMap.set(
        dateKey,
        cattlePurchaseBySlaughterDateGroup + cattleQuantity,
      );

      if (
        !cattlePurchaseByCattleClassificationMap.has(cattleClassificationKey)
      ) {
        const group = {
          cattleQuantity: 0,
          commissionPrice: 0,
          freightPrice: 0,
          purchasePrice: 0,
          totalValue: 0,
          percent: 0,
        };
        cattlePurchaseByCattleClassificationMap.set(
          cattleClassificationKey,
          group,
        );
      }
      const cattlePurchaseByCattleClassificationGroup =
        cattlePurchaseByCattleClassificationMap.get(cattleClassificationKey)!;
      cattlePurchaseByCattleClassificationGroup.cattleQuantity +=
        cattleQuantity;
      cattlePurchaseByCattleClassificationGroup.commissionPrice +=
        commissionPrice;
      cattlePurchaseByCattleClassificationGroup.freightPrice += freightPrice;
      cattlePurchaseByCattleClassificationGroup.purchasePrice += purchasePrice;
      cattlePurchaseByCattleClassificationGroup.totalValue += totalValue;

      if (!cattlePurchaseByCattleAdvisorMap.has(cattleAdvisorKey)) {
        const group = {
          cattleAdvisorCode: item.cattleAdvisorCode,
          cattleAdvisorName: item.cattleAdvisorName,
          cattleQuantity: 0,
          commissionPrice: 0,
          freightPrice: 0,
          purchasePrice: 0,
          totalValue: 0,
          percent: 0,
        };
        cattlePurchaseByCattleAdvisor.push(group);
        cattlePurchaseByCattleAdvisorMap.set(cattleAdvisorKey, group);
      }
      const cattlePurchaseByCattleAdvisorGroup =
        cattlePurchaseByCattleAdvisorMap.get(cattleAdvisorKey)!;
      cattlePurchaseByCattleAdvisorGroup.cattleQuantity += cattleQuantity;
      cattlePurchaseByCattleAdvisorGroup.commissionPrice += commissionPrice;
      cattlePurchaseByCattleAdvisorGroup.freightPrice += freightPrice;
      cattlePurchaseByCattleAdvisorGroup.purchasePrice += purchasePrice;
      cattlePurchaseByCattleAdvisorGroup.totalValue += totalValue;

      if (!cattlePurchaseByCattleOwnerMap.has(cattleOwnerKey)) {
        const group = {
          cattleOwnerCode: item.cattleOwnerCode,
          cattleOwnerName: item.cattleOwnerName,
          cattleQuantity: 0,
          commissionPrice: 0,
          freightPrice: 0,
          purchasePrice: 0,
          totalValue: 0,
          percent: 0,
        };
        cattlePurchaseByCattleOwner.push(group);
        cattlePurchaseByCattleOwnerMap.set(cattleOwnerKey, group);
      }
      const cattlePurchaseByCattleOwnerGroup =
        cattlePurchaseByCattleOwnerMap.get(cattleOwnerKey)!;
      cattlePurchaseByCattleOwnerGroup.cattleQuantity += cattleQuantity;
      cattlePurchaseByCattleOwnerGroup.commissionPrice += commissionPrice;
      cattlePurchaseByCattleOwnerGroup.freightPrice += freightPrice;
      cattlePurchaseByCattleOwnerGroup.purchasePrice += purchasePrice;
      cattlePurchaseByCattleOwnerGroup.totalValue += totalValue;
    }

    totals.weightInArroba = data.reduce(
      (acc, i) => acc + i.cattleWeightInArroba,
      0,
    );
    totals.weightInKg = data.reduce((acc, i) => acc + i.cattleWeightInKg, 0);
    totals.cattleQuantity = data.reduce((acc, i) => acc + i.cattleQuantity, 0);
    totals.commissionValue = data.reduce(
      (acc, i) => acc + i.commissionPrice,
      0,
    );
    totals.freightValue = data.reduce((acc, i) => acc + i.freightPrice, 0);
    totals.purchaseValue = data.reduce((acc, i) => acc + i.purchasePrice, 0);
    totals.finalValue = data.reduce((acc, i) => acc + i.totalValue, 0);
    totals.headPrice = totals.finalValue / totals.cattleQuantity;
    totals.arrobaPrice = totals.finalValue / totals.weightInArroba;
    totals.kgPrice = totals.finalValue / totals.weightInArroba / 15;

    kpis.headPrice = totals.headPrice;
    kpis.arrobaPrice = totals.finalValue / totals.weightInArroba;
    kpis.kgPrice = totals.finalValue / totals.weightInArroba / 15;
    kpis.freightPercentOverTotal = totals.freightValue / totals.finalValue;
    kpis.commissionPercentOverTotal =
      totals.commissionValue / totals.finalValue;

    for (const [, obj] of cattlePurchaseByCompanyMap) {
      obj.percent = obj.totalValue / totals.finalValue;
    }

    for (const [, obj] of cattlePurchaseByCattleOwnerMap) {
      obj.percent = obj.totalValue / totals.finalValue;
    }

    for (const [, obj] of cattlePurchaseByCattleClassificationMap) {
      obj.percent = obj.totalValue / totals.finalValue;
    }

    for (const [, obj] of cattlePurchaseByCattleAdvisorMap) {
      obj.percent = obj.totalValue / totals.finalValue;
    }

    return {
      totals,
      kpis,
      cattlePurchaseByCompany: Object.fromEntries(cattlePurchaseByCompanyMap),
      cattlePurchaseQuantityBySlaughterDate: Object.fromEntries(
        cattlePurchaseQuantityBySlaughterDateMap,
      ),
      cattlePurchaseByCattleClassification: Object.fromEntries(
        cattlePurchaseByCattleClassificationMap,
      ),
      cattlePurchaseByCattleAdvisor: Object.fromEntries(
        cattlePurchaseByCattleAdvisorMap,
      ),
      cattlePurchaseByCattleAdvisorList: cattlePurchaseByCattleAdvisor,
      cattlePurchaseByCattleOwner: Object.fromEntries(
        cattlePurchaseByCattleOwnerMap,
      ),
      cattlePurchaseByCattleOwnerList: cattlePurchaseByCattleOwner,
    };
  }
}
