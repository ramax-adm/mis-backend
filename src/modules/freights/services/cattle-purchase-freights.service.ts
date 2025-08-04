import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CATTLE_PURCHASE_FREIGHTS_QUERY } from '../constants/cattle-purchase-freights-query';
import { CattlePurchaseFreight } from '@/core/entities/sensatta/cattle-purchase-freight.entity';
import { GetCattlePurchaseFreightLastUpdatedAtResponseDto } from '../dtos/get-cattle-purchase-freight-last-updated-at-response.dto';
import { GetCattlePurchaseFreightsResponse } from '../types/cattle-purchase-freights.types';
import { GetAnalyticalCattlePurchaseFreightsResponseDto } from '../dtos/get-analytical-cattle-purchase-freights-response.dto';
import { CattlePurchaseFreightsStatusEnum } from '../enums/cattle-purchase-freights-status.enum';

@Injectable()
export class CattlePurchaseFreightService {
  constructor(private readonly dataSource: DataSource) {}

  async getCattlePurchaseFreightLastUpdatedAt() {
    const [freight] = await this.dataSource.manager.find(
      CattlePurchaseFreight,
      { take: 1 },
    );

    // Toda vez que eu atualizo os dados (dou carga novamente) o dado é recriado
    return {
      updatedAt: freight.createdAt,
    } as GetCattlePurchaseFreightLastUpdatedAtResponseDto;
  }

  async getData({
    companyCode = '',
    startDate = new Date('2025-01-01'),
    endDate = new Date('2025-01-01'),
    freightCompany = '',
    status = '',
    cattleAdvisor = '',
  }: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    companyCode?: string;
    freightCompany?: string;
    cattleAdvisor?: string;
  }) {
    const data = await this.dataSource.query<
      GetCattlePurchaseFreightsResponse[]
    >(CATTLE_PURCHASE_FREIGHTS_QUERY, [
      startDate,
      endDate,
      companyCode,
      status,
      freightCompany,
      cattleAdvisor,
    ]);

    return data;
  }

  async getAnalyticalFreightData({
    startDate,
    endDate,
    companyCode,
    status = '',
    freightCompany,
  }: {
    startDate?: Date;
    endDate?: Date;
    companyCode?: string;
    status?: string;
    freightCompany?: string;
  }) {
    const data = await this.getData({
      startDate,
      endDate,
      companyCode,
      status,
      freightCompany,
    });

    const response = data.map((item) =>
      GetAnalyticalCattlePurchaseFreightsResponseDto.create(item),
    );

    return response;
  }

  async getResumeFreightData({
    startDate,
    endDate,
    companyCode,
    freightCompany,
    cattleAdvisor,
  }: {
    startDate?: Date;
    endDate?: Date;
    companyCode?: string;
    freightCompany?: string;
    cattleAdvisor?: string;
  }) {
    const data = await this.getData({
      startDate,
      endDate,
      companyCode,
      freightCompany,
      cattleAdvisor,
    });

    const totals = {
      quantity: data.length,
      quantityActive: 0,
      quantityClosed: 0,
      quantityNoFreight: 0,
      cattleQuantityActiveFreights: 0,
      cattleQuantityClosedFreights: 0,
      cattleQuantityNoFreights: 0,
      negotiatedPrice: 0,
      tablePrice: 0,
      difPrice: 0,
    };

    const quantityClosedByFreightCompany = new Map<
      string,
      { quantity: number; percent?: number }
    >();
    const quantityActiveByFreightCompany = new Map<
      string,
      { quantity: number; percent?: number }
    >();

    const day = new Map<string, number>();
    const priceByFreightCompany = new Map<string, number>();

    const freightsOverPriceTable: {
      date: string;
      purchaseCattleOrderId: string;
      freightCompany: string;
      cattleAdvisor: string;
      cattleQuantity: number;
      negotiatedPrice: number;
      tablePrice: number;
      difPrice: number;
    }[] = [];

    const freightsByFreightCompany: {
      freightCompanyCode: string;
      freightCompany: string;
      cattleQuantity: number;
      negotiatedPrice: number;
      tablePrice: number;
      difPrice: number;
    }[] = [];

    const freightsByCattleAdvisor: {
      cattleAdvisorCode: string;
      cattleAdvisor: string;
      cattleQuantity: number;
      negotiatedPrice: number;
      tablePrice: number;
      difPrice: number;
    }[] = [];

    const freightsByFreightType: {
      freightType: string;
      cattleQuantity: number;
      negotiatedPrice: number;
      tablePrice: number;
      difPrice: number;
    }[] = [];

    const freightCompanyTracker = new Map<
      string,
      (typeof freightsByFreightCompany)[0]
    >();
    const cattleAdvisorTracker = new Map<
      string,
      (typeof freightsByCattleAdvisor)[0]
    >();
    const freightTypeTracker = new Map<
      string,
      (typeof freightsByFreightType)[0]
    >();

    for (const item of data) {
      const status = item.status;
      const dateKey = item.slaughter_date.toISOString().split('T')[0];
      const freightCompany = item.freight_company_name || 'SEM TRANSPORTADORA';
      const advisor = item.cattle_advisor_name || 'SEM ASSESSOR';
      const transportType = item.freight_transport_type || 'SEM TIPO';
      const isNoFreight = transportType === 'SEM FRETE';

      if (isNoFreight) {
        totals.quantityNoFreight++;
        totals.cattleQuantityNoFreights += item.cattle_quantity;
      } else if (status === CattlePurchaseFreightsStatusEnum.CLOSED) {
        totals.quantityClosed++;
        totals.cattleQuantityClosedFreights += item.cattle_quantity;
        totals.negotiatedPrice += item.negotiated_freight_price;
        totals.tablePrice += item.reference_freight_table_price;
        totals.difPrice += item.dif_price;
      } else if (status === CattlePurchaseFreightsStatusEnum.OPEN) {
        totals.quantityActive++;
        totals.cattleQuantityActiveFreights += item.cattle_quantity;
      }

      day.set(dateKey, (day.get(dateKey) || 0) + item.cattle_quantity);

      // Atualiza mapas com quantity
      if (status === CattlePurchaseFreightsStatusEnum.CLOSED) {
        const current = quantityClosedByFreightCompany.get(freightCompany) || {
          quantity: 0,
        };
        current.quantity += 1;
        quantityClosedByFreightCompany.set(freightCompany, current);
      } else if (status === CattlePurchaseFreightsStatusEnum.OPEN) {
        const current = quantityActiveByFreightCompany.get(freightCompany) || {
          quantity: 0,
        };
        current.quantity += 1;
        quantityActiveByFreightCompany.set(freightCompany, current);
      }

      priceByFreightCompany.set(
        freightCompany,
        (priceByFreightCompany.get(freightCompany) || 0) +
          item.negotiated_freight_price,
      );

      // Fretes por transportadora
      if (!freightCompanyTracker.has(freightCompany)) {
        const group = {
          freightCompanyCode: item.purchase_cattle_order_id,
          freightCompany,
          cattleQuantity: 0,
          negotiatedPrice: 0,
          tablePrice: 0,
          difPrice: 0,
        };
        freightsByFreightCompany.push(group);
        freightCompanyTracker.set(freightCompany, group);
      }

      const freightGroup = freightCompanyTracker.get(freightCompany)!;
      freightGroup.cattleQuantity += item.cattle_quantity;
      freightGroup.negotiatedPrice += item.negotiated_freight_price;
      freightGroup.tablePrice += item.reference_freight_table_price;
      freightGroup.difPrice += item.dif_price;

      // Fretes por assessor
      if (!cattleAdvisorTracker.has(advisor)) {
        const group = {
          cattleAdvisorCode: item.purchase_cattle_order_id,
          cattleAdvisor: advisor,
          cattleQuantity: 0,
          negotiatedPrice: 0,
          tablePrice: 0,
          difPrice: 0,
        };
        freightsByCattleAdvisor.push(group);
        cattleAdvisorTracker.set(advisor, group);
      }

      const advisorGroup = cattleAdvisorTracker.get(advisor)!;
      advisorGroup.cattleQuantity += item.cattle_quantity;
      advisorGroup.negotiatedPrice += item.negotiated_freight_price;
      advisorGroup.tablePrice += item.reference_freight_table_price;
      advisorGroup.difPrice += item.dif_price;

      // Fretes por tipo de transporte
      if (!freightTypeTracker.has(transportType)) {
        const group = {
          freightType: transportType,
          cattleQuantity: 0,
          negotiatedPrice: 0,
          tablePrice: 0,
          difPrice: 0,
        };
        freightsByFreightType.push(group);
        freightTypeTracker.set(transportType, group);
      }

      const typeGroup = freightTypeTracker.get(transportType)!;
      typeGroup.cattleQuantity += item.cattle_quantity;
      typeGroup.negotiatedPrice += item.negotiated_freight_price;
      typeGroup.tablePrice += item.reference_freight_table_price;
      typeGroup.difPrice += item.dif_price;

      if (item.negotiated_freight_price > item.reference_freight_table_price) {
        freightsOverPriceTable.push({
          date: dateKey,
          purchaseCattleOrderId: item.purchase_cattle_order_id,
          freightCompany: item.freight_company_name,
          cattleAdvisor: item.cattle_advisor_name,
          cattleQuantity: item.cattle_quantity,
          negotiatedPrice: item.negotiated_freight_price,
          tablePrice: item.reference_freight_table_price,
          difPrice: item.dif_price,
        });
      }
    }

    // Calcula porcentagens após o loop
    for (const [, obj] of quantityClosedByFreightCompany) {
      obj.percent = obj.quantity / (totals.quantityClosed || 1);
    }

    for (const [, obj] of quantityActiveByFreightCompany) {
      obj.percent = obj.quantity / (totals.quantityActive || 1);
    }

    const byStatus = {
      quantityActive: totals.quantityActive,
      percentActive: totals.quantityActive / totals.quantity,
      quantityClosed: totals.quantityClosed,
      percentClosed: totals.quantityClosed / totals.quantity,
      quantityNoFreight: totals.quantityNoFreight,
      percentNoFreight: totals.quantityNoFreight / totals.quantity,
    };

    return {
      totals,
      status: byStatus,
      quantityClosedByFreightCompany: Object.fromEntries(
        quantityClosedByFreightCompany,
      ),
      quantityActiveByFreightCompany: Object.fromEntries(
        quantityActiveByFreightCompany,
      ),
      day: Object.fromEntries(day),
      priceByFreightCompany: Object.fromEntries(priceByFreightCompany),
      freightsOverPriceTable,
      freightsByFreightCompany,
      freightsByCattleAdvisor,
      freightsByFreightType,
    };
  }
}
