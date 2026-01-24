import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ReturnOccurrence } from '@/modules/sales/entities/return-occurrence.entity';
import { GetBusinessAuditReturnOccurrencesDataResponseDto } from '../dtos/response/get-business-return-ocurrences-data-response.dto';
import { NumberUtils } from '@/modules/utils/services/number.utils';
import { ReturnOccurrenceReturnTypeEnum } from '../enums/return-types.enum';
import { OccurrenceAgg } from '../types/get-return-occurrences-data.type';

@Injectable()
export class BusinessAuditReturnOccurrencesService {
  constructor(private readonly datasource: DataSource) {}

  // METODOS PRINCIPAIS
  async getReturnOccurrencesAuditData({
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
    /**
     * B.O	
     * Data Faturamento	
     * Data Devolução	
     * Motivo	
     * Tipo Devolução	
     * Cod Empresa	
     * Empresa	
     * NF Faturamento	
     * NF Devolução	
     * Cod. Cliente	
     * Cliente	
     * Cod. Representante	
     * Representante	 
     * Qtd Itens Faturamento 	 
     * Qtd Itens Devolução 	
     * Valor Faturamento 	 
     * Valor Devolução 	

     */
    const occurrencesMap = new Map<string, OccurrenceAgg>();
    const occurrencesByCompany = new Map<string, any>();
    const occurrencesByCause = new Map<string, any>();
    const occurrencesByRepresentative = new Map<string, any>();
    const occurrencesByClient = new Map<string, any>();
    const occurrencesByProduct = new Map<string, any>();
    const occurrencesByDay = new Map<string, any>();
    const occurrencesByType = new Map<string, any>();

    for (const occurrence of returnOccurrences) {
      const occurrenceKey = occurrence.occurrenceNumber;
      const companyKey = `${occurrence.companyCode} - ${occurrence.companyName}`;
      const returnTypeKey = occurrence.returnType;
      const causeKey = occurrence.occurrenceCause;
      const representativeKey = `${occurrence.salesRepresentativeCode} - ${occurrence.salesRepresentativeName}`;
      const clientKey = `${occurrence.clientCode} - ${occurrence.clientName}`;
      const productKey = `${occurrence.productCode} - ${occurrence.productName}`;
      const dayKey = new Date(occurrence.date)?.toISOString();

      // p/ b.o
      if (!occurrencesMap.has(occurrenceKey)) {
        occurrencesMap.set(occurrenceKey, {
          occurrenceNumber: occurrence.occurrenceNumber,
          date: occurrence.date,
          invoiceDate: occurrence.invoiceDate,
          occurrenceCause: occurrence.occurrenceCause,
          returnType: occurrence.returnType,
          companyCode: occurrence.companyCode,
          companyName: occurrence.companyName,
          invoiceNfNumber: occurrence.invoiceNf,
          returnNfNumber: occurrence.returnNf,
          clientCode: occurrence.clientCode,
          clientName: occurrence.clientName,
          salesRepresentativeCode: occurrence.salesRepresentativeCode,
          salesRepresentativeName: occurrence.salesRepresentativeName,
          returnQuantity: 0,
          invoiceQuantity: 0,
          returnWeightInKg: 0,
          invoiceWeightInKg: 0,
          returnValue: 0,
          invoiceValue: 0,
        });
      }
      const currentOccurrence = occurrencesMap.get(occurrenceKey)!;
      currentOccurrence.returnQuantity += occurrence.returnQuantity;
      currentOccurrence.invoiceQuantity += occurrence.invoiceQuantity;
      currentOccurrence.returnWeightInKg += occurrence.returnWeightInKg;
      currentOccurrence.invoiceWeightInKg += occurrence.invoiceWeightInKg;
      currentOccurrence.returnValue += occurrence.returnValue;
      currentOccurrence.invoiceValue += occurrence.invoiceValue;

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
          occurrences: new Set<string>(),
          count: 0,
          quantity: 0,
          weightInKg: 0,
          value: 0,
        });
      }

      const currentOccurrencesByDay = occurrencesByDay.get(dayKey)!;
      currentOccurrencesByDay.occurrences.add(occurrence.occurrenceNumber);
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

    for (const [, obj] of occurrencesByDay) {
      obj.count = obj.occurrences.size;
    }

    const occurrencesByTypeTotals = this.getDataTotals(
      occurrencesByType,
      occurrencesMap.size,
    );
    for (const [, obj] of occurrencesByType) {
      obj.percentValue = NumberUtils.nb2(
        obj.value / occurrencesByTypeTotals.value,
      );
    }

    const occurrencesByCauseTotals = this.getDataTotals(
      occurrencesByCause,
      occurrencesMap.size,
    );

    for (const [, obj] of occurrencesByCause) {
      obj.percentValue = NumberUtils.nb2(
        obj.value / occurrencesByCauseTotals.value,
      );
    }

    return new GetBusinessAuditReturnOccurrencesDataResponseDto({
      occurrencesByCause: {
        data: Object.fromEntries(occurrencesByCause),
        totals: this.getDataTotals(occurrencesByCause, occurrencesMap.size),
      },
      occurrencesByClient: {
        data: Object.fromEntries(occurrencesByClient),
        totals: this.getDataTotals(occurrencesByClient, occurrencesMap.size),
      },
      occurrencesByCompany: {
        data: Object.fromEntries(occurrencesByCompany),
        totals: this.getDataTotals(occurrencesByCompany, occurrencesMap.size),
      },
      occurrencesByDay: {
        data: Object.fromEntries(occurrencesByDay),
        totals: this.getDataTotals(occurrencesByDay, occurrencesMap.size),
      },
      occurrencesByProduct: {
        data: Object.fromEntries(occurrencesByProduct),
        totals: this.getDataTotals(occurrencesByProduct, occurrencesMap.size),
      },
      occurrencesByRepresentative: {
        data: Object.fromEntries(occurrencesByRepresentative),
        totals: this.getDataTotals(
          occurrencesByRepresentative,
          occurrencesMap.size,
        ),
      },
      occurrencesByType: Object.fromEntries(occurrencesByType),
      occurrences: {
        data: Object.fromEntries(occurrencesMap),
        totals: Array.from(occurrencesMap.values()).reduce(
          (acc, i) => ({
            count: occurrencesMap.size,
            quantity: acc.quantity + i.returnQuantity,
            weightInKg: acc.weightInKg + i.returnWeightInKg,
            value: acc.value + i.returnValue,
          }),
          { count: 0, quantity: 0, weightInKg: 0, value: 0 },
        ),
      },
    });
  }

  // METODOS AUX
  private getDataTotals<
    T extends {
      count?: number;
      quantity?: number;
      weightInKg?: number;
      value?: number;
    },
  >(map: Map<string, T>, returnOccurrencesSize: number = 0) {
    const totals = Array.from(map.values()).reduce(
      (acc, item) => {
        acc.count += item.count ?? 0;
        acc.quantity += item.quantity ?? 0;
        acc.weightInKg += item.weightInKg ?? 0;
        acc.value += item.value ?? 0;
        return acc;
      },
      { count: 0, quantity: 0, weightInKg: 0, value: 0 },
    );
    return { ...totals, count: returnOccurrencesSize };
  }

  // FETCH DE DADOS
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
}
