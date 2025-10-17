import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InventoryItem } from '../entities/inventory-item.entity';
import { InventoryGetAnalyticalDataRequestDto } from '../dtos/request/inventory-get-analytical-data-request.dto';
import { InventoryItemTraceability } from '../entities/inventory-item-traceability.entity';
import {
  GetInventoryItemWithTraceability,
  GetInventoryItemWithTraceabilityRaw,
} from '../types/get-inventory-items-with-traceability.type';
import { InventoryGetAnalyticalDataResponseDto } from '../dtos/response/inventory-get-analytical-data-response.dto';
import { DateUtils } from '@/modules/utils/services/date.utils';
import {
  GetInventoryItemsAgg,
  GetInventoryItemsByProductAgg,
} from '../types/get-inventory.type';
import { NumberUtils } from '@/modules/utils/services/number.utils';
import { Inventory } from '../entities/inventory.entity';
import { InventoryGetResumeDataRequestDto } from '../dtos/request/inventory-get-resume-data-request.dto';
import { InventoryItemTraceabilityOperationEnum } from '../enums/inventory-item-traceability-operation.enum';
import {
  InventoryGetResumeDataResponseDto,
  InventoryResumeDataDto,
  InventoryResumeTotalsDto,
} from '../dtos/response/inventory-get-resume-data-response.dto';

@Injectable()
export class InventoryService {
  // Inventory service methods would go here
  constructor(private readonly dataSource: DataSource) {}

  async getInventoryItemsWithTraceability({
    companyCode,
    inventoryId,
    boxNumber,
  }: {
    companyCode: string;
    inventoryId: string;
    boxNumber?: string;
  }): Promise<GetInventoryItemWithTraceability[]> {
    // 1️⃣ QueryBuilder com JOIN
    const qb = this.dataSource
      .createQueryBuilder()
      .select([
        'sii.id',
        'sii.inventory_id',
        'si.company_code',
        'si.warehouse_code',
        'sii.box_number',
        'sii.production_date',
        'sii.due_date',
        'sii.product_id',
        'sii.product_code',
        'sii.product_name',
        'sii.sif_code',
        'sii.weight_in_kg',
        'sii.tare_weight_in_kg',
        'sii.sensatta_created_by',

        // campos da traceability
        'siit.id AS traceability_id',
        'siit.date AS traceability_date',
        'siit.operation AS operation',
        'siit.status AS status',
        'siit.line1 AS line1',
        'siit.line2 AS line2',
        'siit.line3 AS line3',
        'siit.line4 AS line4',
        'siit.line5 AS line5',
        'siit.line6 AS line6',
      ])
      .from(InventoryItem, 'sii')
      .leftJoin(Inventory, 'si', 'sii.inventory_id = si.sensatta_id')
      .leftJoin(
        InventoryItemTraceability,
        'siit',
        'sii.box_number = siit.box_number',
      )
      .where('1=1')
      .andWhere('si.company_code = :companyCode', { companyCode })
      .andWhere('sii.inventory_id = :inventoryId', { inventoryId });

    if (boxNumber) {
      qb.andWhere('sii.box_number ILIKE :boxNumber', {
        boxNumber: `%${boxNumber}%`,
      });
    }

    const rawResult =
      await qb.getRawMany<GetInventoryItemWithTraceabilityRaw>();

    return rawResult.map((i) => ({
      id: i.id,
      inventoryId: i.inventory_id,
      warehouseCode: i.warehouse_code,
      boxNumber: i.box_number,
      productionDate: i.production_date,
      dueDate: i.due_date,
      productId: i.product_id,
      productCode: i.product_code,
      productName: i.product_name,
      sifCode: i.sif_code,
      weightInKg: i.weight_in_kg,
      tareWeightInKg: i.tare_weight_in_kg,
      sensattaCreatedBy: i.sensatta_created_by,
      traceabilityId: i.traceability_id,
      traceabilityDate: i.traceability_date,
      operation: i.operation,
      status: i.status,
      line1: i.line1,
      line2: i.line2,
      line3: i.line3,
      line4: i.line4,
      line5: i.line5,
      line6: i.line6,
    }));
  }

  async getAnalyticalData({
    companyCode,
    inventoryId,
    boxNumber,
  }: InventoryGetAnalyticalDataRequestDto): Promise<InventoryGetAnalyticalDataResponseDto> {
    const inventoryItemsWithTraceability =
      await this.getInventoryItemsWithTraceability({
        companyCode,
        inventoryId,
        boxNumber,
      });

    // ✅ Mapa para agregar por boxNumber
    const inventoryItemsAgg = new Map<string, GetInventoryItemsAgg>();

    // ✅ Loop principal (imperativo)
    for (const item of inventoryItemsWithTraceability) {
      // Chave de agrupamento (boxNumber)
      const key = item.boxNumber;

      // Verifica se o item já foi adicionado
      if (!inventoryItemsAgg.has(key)) {
        inventoryItemsAgg.set(key, {
          inventoryId: item.inventoryId,
          warehouseCode: item.warehouseCode ?? '',
          productCode: item.productCode,
          productName: item.productName,
          boxNumber: item.boxNumber,
          weightInKg: item.weightInKg ?? 0,
          events: {},
        });
      }

      // Recupera o registro atual agregado
      const aggregatedItem = inventoryItemsAgg.get(key);

      // Se houver rastreabilidade, adiciona evento
      if (item.traceabilityId) {
        // Concatena status + date + linhas (ignorando null)
        const lines = [
          item.line1?.trim(),
          item.line2?.trim(),
          item.line3?.trim(),
          item.line4?.trim(),
          item.line5?.trim(),
          item.line6?.trim(),
        ].filter((v) => !!v);

        // Cria chave incremental event_N
        const eventKey = `event${Object.keys(aggregatedItem.events).length + 1}`;
        const eventValue = [
          item.status ?? '',
          DateUtils.format(item.traceabilityDate, 'date') ?? '',
          ...lines,
        ]
          .filter((v) => !!v)
          .join('; ');
        aggregatedItem.events[eventKey] = eventValue;
      }
    }

    const responseData = Array.from(inventoryItemsAgg.values());
    const responseTotals = responseData.reduce(
      (acc, item) => ({
        count: acc.count + 1,
        totalWeight: NumberUtils.nb2(acc.totalWeight + item.weightInKg),
      }),
      {
        count: 0,
        totalWeight: 0,
      },
    );

    return new InventoryGetAnalyticalDataResponseDto({
      data: responseData,
      totals: responseTotals,
    });
  }

  async getResumeData({
    companyCode,
    inventoryId,
  }: InventoryGetResumeDataRequestDto) {
    const inventoryItemsWithTraceability =
      await this.getInventoryItemsWithTraceability({
        companyCode,
        inventoryId,
      });

    const inventoryItemsByProductAgg = new Map<
      string,
      GetInventoryItemsByProductAgg
    >();

    // Agrupa os itens retornados do DB em produtos e saldos
    for (const item of inventoryItemsWithTraceability) {
      const key = `${item.productCode}-${item.productName}`;

      if (!inventoryItemsByProductAgg.has(key)) {
        inventoryItemsByProductAgg.set(key, {
          inventoryId: item.inventoryId,
          warehouseCode: item.warehouseCode ?? '',
          productCode: item.productCode,
          productName: item.productName,
          inventoryQuantity: 0,
          inventoryWeightInKg: 0,
          stockQuantity: 0,
          stockWeightInKg: 0,
          blockedQuantity: 0,
          blockedWeightInKg: 0,
          cancelatedQuantity: 0,
          cancelatedWeightInKg: 0,
          dispatchedQuantity: 0,
          dispatchedWeightInKg: 0,
          quantityDif: 0,
          weightInKgDif: 0,
          traceabilityEvents: new Map<string, any[]>(),
        });
      }

      if (!item.traceabilityId || !item.boxNumber) {
        continue;
      }

      const aggregatedItem = inventoryItemsByProductAgg.get(key);
      const boxTraceabilityEvents =
        aggregatedItem.traceabilityEvents.get(item.boxNumber) ?? [];

      boxTraceabilityEvents.push({
        id: item.traceabilityId,
        date: item.traceabilityDate,
        operation: item.operation,
        boxNumber: item.boxNumber,
        inventoryId: item.inventoryId,
        weightInKg: item.weightInKg,
      });

      aggregatedItem.traceabilityEvents.set(
        item.boxNumber,
        boxTraceabilityEvents,
      );
    }

    // Contabilização de variações
    for (const aggregatedItem of inventoryItemsByProductAgg.values()) {
      const traceabilityEvents = aggregatedItem.traceabilityEvents;
      if (!traceabilityEvents.size) continue;

      for (const [, boxTraces] of traceabilityEvents.entries()) {
        if (!boxTraces.length) {
          continue;
        }

        // Ordena por data e pega o último trace da caixa
        const sortedTraces = boxTraces.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );

        const traceToConsider = sortedTraces.at(1);
        if (!traceToConsider?.operation) {
          continue;
        }

        const traceabilityOperation = traceToConsider.operation;
        switch (traceabilityOperation) {
          case InventoryItemTraceabilityOperationEnum.BLOQUEADA:
            aggregatedItem.blockedQuantity += 1;
            aggregatedItem.blockedWeightInKg += traceToConsider.weightInKg ?? 0;
            break;

          case InventoryItemTraceabilityOperationEnum.CANCELADA:
            aggregatedItem.cancelatedQuantity += 1;
            aggregatedItem.cancelatedWeightInKg +=
              traceToConsider.weightInKg ?? 0;
            break;

          case InventoryItemTraceabilityOperationEnum.EXPEDICAO:
          case InventoryItemTraceabilityOperationEnum.FATURAMENTO:
          default:
            aggregatedItem.dispatchedQuantity += 1;
            aggregatedItem.dispatchedWeightInKg +=
              traceToConsider.weightInKg ?? 0;
            break;
        }
      }
    }

    // Response
    const responseData: InventoryResumeDataDto[] = Array.from(
      inventoryItemsByProductAgg.values(),
    ).map(
      (item) =>
        ({
          inventoryId: item.inventoryId,
          warehouseCode: item.warehouseCode,
          productCode: item.productCode,
          productName: item.productName,
          inventoryQuantity: item.inventoryQuantity,
          inventoryWeightInKg: item.inventoryWeightInKg,
          stockQuantity: item.stockQuantity,
          stockWeightInKg: item.stockWeightInKg,
          blockedQuantity: item.blockedQuantity,
          blockedWeightInKg: item.blockedWeightInKg,
          cancelatedQuantity: item.cancelatedQuantity,
          cancelatedWeightInKg: item.cancelatedWeightInKg,
          dispatchedQuantity: item.dispatchedQuantity,
          dispatchedWeightInKg: item.dispatchedWeightInKg,
          quantityDif: item.quantityDif,
          weightInKgDif: item.weightInKgDif,
        }) as InventoryResumeDataDto,
    );

    const responseTotals: InventoryResumeTotalsDto = responseData.reduce(
      (acc, item) => ({
        count: (acc.count += 1),
        stockQuantity: (acc.stockQuantity += item.stockQuantity),
        stockWeightInKg: (acc.stockWeightInKg += item.stockWeightInKg),
        blockedQuantity: (acc.blockedQuantity += item.blockedQuantity),
        blockedWeightInKg: (acc.blockedWeightInKg += item.blockedWeightInKg),
        cancelatedQuantity: (acc.cancelatedQuantity += item.cancelatedQuantity),
        cancelatedWeightInKg: (acc.cancelatedWeightInKg +=
          item.cancelatedWeightInKg),
        dispatchedQuantity: (acc.dispatchedQuantity += item.dispatchedQuantity),
        dispatchedWeightInKg: (acc.dispatchedWeightInKg +=
          item.dispatchedWeightInKg),
        quantityDif: (acc.quantityDif += item.quantityDif),
        weightInKgDif: (acc.weightInKgDif += item.weightInKgDif),
      }),
      {
        count: 0,
        stockQuantity: 0,
        stockWeightInKg: 0,
        blockedQuantity: 0,
        blockedWeightInKg: 0,
        cancelatedQuantity: 0,
        cancelatedWeightInKg: 0,
        dispatchedQuantity: 0,
        dispatchedWeightInKg: 0,
        quantityDif: 0,
        weightInKgDif: 0,
      },
    );

    return new InventoryGetResumeDataResponseDto({
      data: responseData,
      totals: responseTotals,
    });
  }
}
