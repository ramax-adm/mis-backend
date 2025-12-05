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
    companyCode,
    cattleAdvisorName = '',
    cattleOwnerName = '',
    cattleClassification = '',
    startDate,
    endDate,
  }: {
    companyCode: string;
    cattleOwnerName?: string;
    cattleAdvisorName?: string;
    cattleClassification?: string;
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
      .where('scp.companyCode = :companyCode', { companyCode });

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
    console.log({ data: result[0] });

    return result.map((i) => ({
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
      cattleWeightInArroba: i.scp_cattle_weight_in_arroba,
      commissionPrice: i.scp_commission_price,
      companyCode: i.scp_company_code,
      companyName: i.scp_company_name,
      createdAt: i.scp_created_at,
      freightPrice: i.scp_freight_price,
      funruralPrice: i.scp_funrural_price,
      arrobaPrice: i.arroba_price,
      headPrice: i.head_price,
      kgPrice: i.kg_price,
      paymentTerm: i.scp_payment_term,
      purchaseLiquidPrice: i.scp_purchase_liquid_price,
      purchasePrice: i.scp_purchase_price,
      totalValue: i.scp_total_value,
      weighingType: i.scp_weighing_type,
    }));
  }

  async getAnalyticalData({
    companyCode,
    cattleAdvisorName = '',
    cattleOwnerName = '',
    cattleClassification = '',
    startDate,
    endDate,
  }: {
    companyCode: string;
    cattleOwnerName?: string;
    cattleAdvisorName?: string;
    cattleClassification?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const data = await this.getData({
      companyCode,
      cattleAdvisorName,
      cattleClassification,
      cattleOwnerName,
      endDate,
      startDate,
    });

    const response = data.map(
      (item) => new GetAnalyticalCattlePurchaseResponseDto(item),
    );

    return response;
  }

  async getAggregatedAnalyticalData({
    companyCode,
    cattleAdvisorName,
    cattleClassification,
    cattleOwnerName,
    endDate,
    startDate,
  }: {
    companyCode: string;
    cattleOwnerName?: string;
    cattleAdvisorName?: string;
    cattleClassification?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const entityKey = 'sensattaId' as keyof CattlePurchase;
    const data = await this.getData({
      companyCode,
      cattleAdvisorName,
      cattleClassification,
      cattleOwnerName,
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
        weightInArroba: item.cattleWeightInArroba * item.cattleQuantity,
        cattleQuantity: item.cattleQuantity,
        freightPrice: item.freightPrice,
        purchasePrice: item.purchasePrice,
        commissionPrice: item.commissionPrice,
        totalValue: item.totalValue,
        arrobaPrice: item.arrobaPrice,
        headPrice: item.headPrice,
        kgPrice: item.kgPrice,
        count: 1,
      };

      if (!map.has(key)) {
        map.set(key, group);
        continue;
      }

      const previousMap = map.get(key)!;
      previousMap.weightInArroba +=
        item.cattleWeightInArroba * item.cattleQuantity;
      previousMap.cattleQuantity += item.cattleQuantity;
      previousMap.freightPrice += item.freightPrice;
      previousMap.purchasePrice += item.purchasePrice;
      previousMap.commissionPrice += item.commissionPrice;
      previousMap.totalValue += item.totalValue;
      previousMap.arrobaPrice += item.arrobaPrice;
      previousMap.headPrice += item.headPrice;
      previousMap.kgPrice += item.kgPrice;
      previousMap.count += 1;
    }
    return Object.fromEntries(map);
  }

  async getResumeData({
    companyCode,
    endDate,
    startDate,
  }: {
    companyCode: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const data = await this.getData({
      companyCode,
      endDate,
      startDate,
    });

    const totals = {
      weightInArroba: 0,
      cattleQuantity: 0,
      freightPrice: 0,
      purchasePrice: 0,
      commissionPrice: 0,
      totalValue: 0,
    };
    const cattlePurchaseQuantityBySlaughterDateMap: Map<string, number> =
      new Map();
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
      const cattleAdvisorName = item.cattleAdvisorName;
      const cattleOwnerName = item.cattleOwnerName;

      const cattleQuantity = item.cattleQuantity;
      const commissionPrice = item.commissionPrice;
      const freightPrice = item.freightPrice;
      const purchasePrice = item.purchasePrice;
      const totalValue = item.totalValue;

      if (!cattlePurchaseQuantityBySlaughterDateMap.has(dateKey)) {
        cattlePurchaseQuantityBySlaughterDateMap.set(dateKey, 0);
      }
      const cattlePurchaseBySlaughterDateGroup =
        cattlePurchaseQuantityBySlaughterDateMap.get(dateKey)!;
      cattlePurchaseQuantityBySlaughterDateMap.set(
        dateKey,
        cattlePurchaseBySlaughterDateGroup + cattleQuantity,
      );

      if (!cattlePurchaseByCattleAdvisorMap.has(cattleAdvisorName)) {
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
        cattlePurchaseByCattleAdvisorMap.set(cattleAdvisorName, group);
      }
      const cattlePurchaseByCattleAdvisorGroup =
        cattlePurchaseByCattleAdvisorMap.get(cattleAdvisorName)!;
      cattlePurchaseByCattleAdvisorGroup.cattleQuantity += cattleQuantity;
      cattlePurchaseByCattleAdvisorGroup.commissionPrice += commissionPrice;
      cattlePurchaseByCattleAdvisorGroup.freightPrice += freightPrice;
      cattlePurchaseByCattleAdvisorGroup.purchasePrice += purchasePrice;
      cattlePurchaseByCattleAdvisorGroup.totalValue += totalValue;

      if (!cattlePurchaseByCattleOwnerMap.has(cattleOwnerName)) {
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
        cattlePurchaseByCattleOwnerMap.set(cattleOwnerName, group);
      }
      const cattlePurchaseByCattleOwnerGroup =
        cattlePurchaseByCattleOwnerMap.get(cattleOwnerName)!;
      cattlePurchaseByCattleOwnerGroup.cattleQuantity += cattleQuantity;
      cattlePurchaseByCattleOwnerGroup.commissionPrice += commissionPrice;
      cattlePurchaseByCattleOwnerGroup.freightPrice += freightPrice;
      cattlePurchaseByCattleOwnerGroup.purchasePrice += purchasePrice;
      cattlePurchaseByCattleOwnerGroup.totalValue += totalValue;
    }

    totals.weightInArroba = data.reduce(
      (acc, i) => acc + i.cattleWeightInArroba * i.cattleQuantity,
      0,
    );
    totals.cattleQuantity = data.reduce((acc, i) => acc + i.cattleQuantity, 0);
    totals.commissionPrice = data.reduce(
      (acc, i) => acc + i.commissionPrice,
      0,
    );
    totals.freightPrice = data.reduce((acc, i) => acc + i.freightPrice, 0);
    totals.purchasePrice = data.reduce((acc, i) => acc + i.purchasePrice, 0);
    totals.totalValue = data.reduce((acc, i) => acc + i.totalValue, 0);

    for (const [, obj] of cattlePurchaseByCattleAdvisorMap) {
      obj.percent = obj.totalValue / totals.totalValue;
    }

    return {
      totals,
      cattlePurchaseQuantityBySlaughterDate: Object.fromEntries(
        cattlePurchaseQuantityBySlaughterDateMap,
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
    /**
     * [08:11, 02/07/2025] Francisco Finpec: monta o dash com gráfico de pizza por assessor.. com %... tipo o da horas extras
     * [08:12, 02/07/2025] Francisco Finpec: grafico de tempo com qtdde  de cabeças compradas
     * [08:13, 02/07/2025] Francisco Finpec: tabela com assessor qtdd total de cabeças / qtdd $frete / qtdd $ comissão / qtdd $ compra
     * tabela com pecuarista;
     */
  }
}
