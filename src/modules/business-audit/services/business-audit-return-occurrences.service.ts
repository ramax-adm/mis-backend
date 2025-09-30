import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ReturnOccurrence } from '@/modules/sales/entities/return-occurrence.entity';
import { GetBusinessAuditReturnOccurrencesDataResponseDto } from '../dtos/response/get-business-return-ocurrences-data-response.dto';
import { NumberUtils } from '@/modules/utils/services/number.utils';
import { ReturnOccurrenceReturnTypeEnum } from '../enums/return-types.enum';

@Injectable()
export class BusinessAuditReturnOccurrencesService {
  constructor(private readonly datasource: DataSource) {}

  // METODOS PRINCIPAIS
  async getReturnOccurrences({
    startDate,
    endDate,
    companyCodes,
    occurrenceCauses,
    occurrenceNumber,
    returnType,
    clientCodes,
    representativeCodes,
  }: {
    startDate?: Date;
    endDate?: Date;
    occurrenceNumber?: string;
    companyCodes?: string[];
    returnType?: string;
    occurrenceCauses?: string[];
    clientCodes?: string[];
    representativeCodes?: string[];
  }) {
    const qb = this.datasource
      .getRepository(ReturnOccurrence)
      .createQueryBuilder('ro')
      .where('1=1');

    if (startDate) {
      qb.andWhere('ro.date >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('ro.date <= :endDate', { endDate });
    }
    if (occurrenceNumber) {
      qb.andWhere('ro.occurrenceNumber ILIKE :occurrenceNumber', {
        occurrenceNumber: `%${occurrenceNumber}%`,
      });
    }

    if (companyCodes) {
      qb.andWhere('ro.companyCode IN (:...companyCodes)', { companyCodes });
    }
    if (returnType) {
      const returnTypeMap = {
        [ReturnOccurrenceReturnTypeEnum.FULL]: 'Integral',
        [ReturnOccurrenceReturnTypeEnum.PARTIAL]: 'Parcial',
      };
      qb.andWhere('ro.returnType ILIKE :returnType', {
        returnType: `%${returnTypeMap[returnType]}%`,
      });
    }
    if (occurrenceCauses) {
      qb.andWhere('ro.occurrenceCause IN (:...occurrenceCauses)', {
        occurrenceCauses,
      });
    }

    if (clientCodes) {
      qb.andWhere('ro.clientCode IN (:...clientCodes)', {
        clientCodes,
      });
    }
    if (representativeCodes) {
      qb.andWhere('ro.salesRepresentativeCode IN (:...representativeCodes)', {
        representativeCodes,
      });
    }

    return await qb.getMany();
  }

  async getData({
    startDate,
    endDate,
    companyCodes,
    occurrenceCauses,
    occurrenceNumber,
    returnType,
    clientCodes,
    representativeCodes,
  }: {
    startDate: Date;
    endDate: Date;
    occurrenceNumber?: string;
    companyCodes?: string[];
    returnType?: string;
    occurrenceCauses?: string[];
    clientCodes?: string[];
    representativeCodes?: string[];
  }) {
    const returnOccurrences = await this.getReturnOccurrences({
      startDate,
      endDate,
      occurrenceNumber,
      companyCodes,
      occurrenceCauses,
      returnType,
      clientCodes,
      representativeCodes,
    });
    // totais p/ cada registro
    /**
     * Quantidade
     * Peso KG
     * Valor R$
     */
    const occurrencesByCompany = new Map<string, any>();
    const occurrencesByCause = new Map<string, any>();
    const occurrencesByRepresentative = new Map<string, any>();
    const occurrencesByClient = new Map<string, any>();
    const occurrencesByProduct = new Map<string, any>();
    const occurrencesByDay = new Map<string, any>();
    const occurrencesByType = new Map<string, any>();

    for (const occurrence of returnOccurrences) {
      const companyKey = `${occurrence.companyCode} - ${occurrence.companyName}`;
      const returnTypeKey = occurrence.returnType;
      const causeKey = occurrence.occurrenceCause;
      const representativeKey = `${occurrence.salesRepresentativeCode} - ${occurrence.salesRepresentativeName}`;
      const clientKey = `${occurrence.clientCode} - ${occurrence.clientName}`;
      const productKey = `${occurrence.productCode} - ${occurrence.productName}`;
      const dayKey = new Date(occurrence.date)?.toISOString();

      // p/ empresa
      if (!occurrencesByCompany.has(companyKey)) {
        occurrencesByCompany.set(companyKey, {
          count: 0,
          quantity: 0,
          weightInKg: 0,
          value: 0,
        });
      }

      const currentOccurrencesByCompany = occurrencesByCompany.get(companyKey)!;
      currentOccurrencesByCompany.count += 1;
      currentOccurrencesByCompany.quantity += occurrence.returnQuantity;
      currentOccurrencesByCompany.weightInKg += occurrence.returnWeightInKg;
      currentOccurrencesByCompany.value += occurrence.returnValue;

      // p/ motivo
      if (!occurrencesByCause.has(causeKey)) {
        occurrencesByCause.set(causeKey, {
          count: 0,
          quantity: 0,
          weightInKg: 0,
          value: 0,
        });
      }

      const currentOccurrencesByCause = occurrencesByCause.get(causeKey)!;
      currentOccurrencesByCause.count += 1;
      currentOccurrencesByCause.quantity += occurrence.returnQuantity;
      currentOccurrencesByCause.weightInKg += occurrence.returnWeightInKg;
      currentOccurrencesByCause.value += occurrence.returnValue;

      // p/ representante
      if (!occurrencesByRepresentative.has(representativeKey)) {
        occurrencesByRepresentative.set(representativeKey, {
          count: 0,
          quantity: 0,
          weightInKg: 0,
          value: 0,
        });
      }

      const currentOccurrencesByRepresentative =
        occurrencesByRepresentative.get(representativeKey)!;
      currentOccurrencesByRepresentative.count += 1;
      currentOccurrencesByRepresentative.quantity += occurrence.returnQuantity;
      currentOccurrencesByRepresentative.weightInKg +=
        occurrence.returnWeightInKg;
      currentOccurrencesByRepresentative.value += occurrence.returnValue;

      // p/ cliente
      if (!occurrencesByClient.has(clientKey)) {
        occurrencesByClient.set(clientKey, {
          count: 0,
          quantity: 0,
          weightInKg: 0,
          value: 0,
        });
      }

      const currentOccurrencesByClient = occurrencesByClient.get(clientKey)!;
      currentOccurrencesByClient.count += 1;
      currentOccurrencesByClient.quantity += occurrence.returnQuantity;
      currentOccurrencesByClient.weightInKg += occurrence.returnWeightInKg;
      currentOccurrencesByClient.value += occurrence.returnValue;

      // p/ produto
      if (!occurrencesByProduct.has(productKey)) {
        occurrencesByProduct.set(productKey, {
          count: 0,
          quantity: 0,
          weightInKg: 0,
          value: 0,
        });
      }

      const currentOccurrencesByProduct = occurrencesByProduct.get(productKey)!;
      currentOccurrencesByProduct.count += 1;
      currentOccurrencesByProduct.quantity += occurrence.returnQuantity;
      currentOccurrencesByProduct.weightInKg += occurrence.returnWeightInKg;
      currentOccurrencesByProduct.value += occurrence.returnValue;

      // p/ dia (quantidade, valor R$)
      if (!occurrencesByDay.has(dayKey)) {
        occurrencesByDay.set(dayKey, {
          count: 0,
          quantity: 0,
          weightInKg: 0,
          value: 0,
        });
      }

      const currentOccurrencesByDay = occurrencesByDay.get(dayKey)!;
      currentOccurrencesByDay.count += 1;
      currentOccurrencesByDay.quantity += occurrence.returnQuantity;
      currentOccurrencesByDay.weightInKg += occurrence.returnWeightInKg;
      currentOccurrencesByDay.value += occurrence.returnValue;

      // p/ tipo
      if (!occurrencesByType.has(returnTypeKey)) {
        occurrencesByType.set(returnTypeKey, {
          quantity: 0,
          percentValue: 0,
          weightInKg: 0,
          value: 0,
        });
      }
      const currentOccurrencesByType = occurrencesByType.get(returnTypeKey)!;
      currentOccurrencesByType.quantity += occurrence.returnQuantity;
      currentOccurrencesByType.weightInKg += occurrence.returnWeightInKg;
      currentOccurrencesByType.value += occurrence.returnValue;
    }

    const occurrencesByTypeTotals = this.getDataTotals(occurrencesByType);
    for (const [, obj] of occurrencesByType) {
      obj.percentValue = NumberUtils.nb2(
        obj.value / occurrencesByTypeTotals.value,
      );
    }

    return new GetBusinessAuditReturnOccurrencesDataResponseDto({
      occurrencesByCause: {
        data: Object.fromEntries(occurrencesByCause),
        totals: this.getDataTotals(occurrencesByCause),
      },
      occurrencesByClient: {
        data: Object.fromEntries(occurrencesByClient),
        totals: this.getDataTotals(occurrencesByClient),
      },
      occurrencesByCompany: {
        data: Object.fromEntries(occurrencesByCompany),
        totals: this.getDataTotals(occurrencesByCompany),
      },
      occurrencesByDay: {
        data: Object.fromEntries(occurrencesByDay),
        totals: this.getDataTotals(occurrencesByDay),
      },
      occurrencesByProduct: {
        data: Object.fromEntries(occurrencesByProduct),
        totals: this.getDataTotals(occurrencesByProduct),
      },
      occurrencesByRepresentative: {
        data: Object.fromEntries(occurrencesByRepresentative),
        totals: this.getDataTotals(occurrencesByRepresentative),
      },
      occurrencesByType: Object.fromEntries(occurrencesByType),
      returnOccurrences: {
        data: returnOccurrences,
        totals: returnOccurrences.reduce(
          (acc, i) => ({
            count: acc.count + 1,
            quantity: acc.quantity + i.returnQuantity,
            weightInKg: acc.weightInKg + i.returnWeightInKg,
            value: acc.value + i.returnValue,
          }),
          { count: 0, quantity: 0, weightInKg: 0, value: 0 },
        ),
      },
    });
  }

  private getDataTotals<
    T extends {
      count?: number;
      quantity?: number;
      weightInKg?: number;
      value?: number;
    },
  >(map: Map<string, T>) {
    return Array.from(map.values()).reduce(
      (acc, item) => {
        acc.count += item.count ?? 0;
        acc.quantity += item.quantity ?? 0;
        acc.weightInKg += item.weightInKg ?? 0;
        acc.value += item.value ?? 0;
        return acc;
      },
      { count: 0, quantity: 0, weightInKg: 0, value: 0 },
    );
  }
}
