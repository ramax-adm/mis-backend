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
  }) {
    const where: FindOptionsWhere<CattlePurchase> = { companyCode };

    if (cattleOwnerName.length > 0) {
      where.cattleOwnerName = ILike(`%${cattleOwnerName}%`);
    }

    if (cattleAdvisorName.length > 0) {
      where.cattleAdvisorName = ILike(`%${cattleAdvisorName}%`);
    }
    if (cattleClassification.length > 0) {
      where.cattleClassification = ILike(`%${cattleClassification}%`);
    }

    if (startDate && endDate) {
      where.slaughterDate = Between(startDate, endDate);
    } else if (startDate) {
      where.slaughterDate = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.slaughterDate = LessThanOrEqual(endDate);
    }

    return await this.dataSource.manager.find<CattlePurchase>(CattlePurchase, {
      where,
      order: {
        slaughterDate: 'ASC',
      },
    });
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
    const entityKey = 'purchaseCattleOrderId' as keyof CattlePurchase;
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
      };

      if (!map.has(key)) {
        map.set(key, group);
        continue;
      }

      if (item.purchaseCattleOrderId === '14696') {
        console.log('oc', item.purchaseCattleOrderId);
        console.log('weightInArroba', item.cattleWeightInArroba);
        console.log(
          'weightInArroba formula',
          item.cattleWeightInArroba * item.cattleQuantity,
        );
        console.log('cattleQuantity', item.cattleQuantity);
      }

      const previousMap = map.get(key)!;
      previousMap.weightInArroba +=
        item.cattleWeightInArroba * item.cattleQuantity;
      previousMap.cattleQuantity += item.cattleQuantity;
      previousMap.freightPrice += item.freightPrice;
      previousMap.purchasePrice += item.purchasePrice;
      previousMap.commissionPrice += item.commissionPrice;
      previousMap.totalValue += item.totalValue;
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
