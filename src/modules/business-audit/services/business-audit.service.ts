import * as dateFns from 'date-fns';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { GetBusinessAuditResumeDataResponseDto } from '../dtos/response/get-business-resume-data-response.dto';
import { NumberUtils } from '@/modules/utils/services/number.utils';
import { StringUtils } from '@/modules/utils/services/string.utils';
import { GetCattlePurchaseFreightsItem } from '../types/get-freights.type';
import { DateUtils } from '@/modules/utils/services/date.utils';
import { GetInvoicesItem } from '../types/get-invoices.type';
import { GetStockIncomingBatchesItem } from '../types/get-stock-incoming-batches.type';

@Injectable()
export class BusinessAuditService {
  constructor(private readonly datasource: DataSource) {}

  // METODO PRINCIPAL
  async getData({ startDate, endDate }: { startDate?: Date; endDate?: Date }) {
    // faturamento
    const [invoices, manuallyEnteredInvoices] = await Promise.all([
      this.getInvoices({
        startDate,
        endDate,
      }),
      this.getManualInvoices({
        startDate,
        endDate,
      }),
    ]);

    const invoicesWithSamePrice = this.getInvoicesWithSamePrice(invoices);
    const invoicesWithSamePriceTotals = invoicesWithSamePrice.reduce(
      (acc, item) => ({
        quantity: acc.quantity + 1,
        totalPrice: acc.totalPrice + item.totalPrice,
      }),
      { quantity: 0, totalPrice: 0 },
    );

    const manuallyEnteredInvoicesByCompanyMap =
      this.getManuallyEnteredInvoicesByKey(
        'companyName',
        manuallyEnteredInvoices,
      );
    const manuallyEnteredInvoicesByClientMap =
      this.getManuallyEnteredInvoicesByKey(
        'clientName',
        manuallyEnteredInvoices,
      );

    const manuallyEnteredInvoicesTotals = manuallyEnteredInvoices.reduce(
      (acc, item) => ({
        quantity: 0,
        productQuantity: 0,
        weightInKg: acc.weightInKg + item.weightInKg,
        totalPrice: acc.totalPrice + item.totalPrice,
      }),
      {
        quantity: 0,
        productQuantity: 0,
        weightInKg: 0,
        totalPrice: 0,
      },
    );

    const manuallyInvoicesByNfNumberSet = new Set();
    manuallyEnteredInvoices.forEach((i) =>
      manuallyInvoicesByNfNumberSet.add(i.nfNumber),
    );
    manuallyEnteredInvoicesTotals.quantity = manuallyInvoicesByNfNumberSet.size;
    manuallyEnteredInvoicesTotals.productQuantity =
      manuallyEnteredInvoices.length;

    // Fretes Compra
    const cattlePurchaseFreights = await this.getFreights({
      startDate,
      endDate,
    });
    const openCattlePurchaseFreights = this.getOpenCattlePurchaseFreights(
      cattlePurchaseFreights,
    );
    const openCattlePurchaseFreightsTotals = {
      quantity: openCattlePurchaseFreights.length,
    };

    const cattlePurchaseFreightsDuplicated =
      this.getDuplicatedFreightsByDateAndPlate(cattlePurchaseFreights);
    const cattlePurchaseFreightsOverTablePrice: {
      date: Date;
      companyCode: string;
      purchaseCattleOrderId: string;
      referenceFreightTablePrice: number;
      negotiatedFreightPrice: number;
    }[] = [];

    const cattlePurchaseFreightsDuplicatedTotals = {
      quantity: cattlePurchaseFreightsDuplicated.length,
    };

    const cattlePurchaseFreightsOverTablePriceTotals = {
      quantity: 0,
      referenceFreightTablePrice: 0,
      negotiatedFreightPrice: 0,
    };

    for (const freight of cattlePurchaseFreights) {
      const { referenceFreightTablePrice, negotiatedFreightPrice } = freight;
      const tenPercentInNumber = 0.1;
      const isFreightOverTenPercertOfReferenceTable =
        NumberUtils.nb2(negotiatedFreightPrice / referenceFreightTablePrice) >
        1 + tenPercentInNumber;

      if (
        isFreightOverTenPercertOfReferenceTable &&
        freight.negotiatedFreightPrice > 1
      ) {
        cattlePurchaseFreightsOverTablePrice.push({
          date: freight.slaughterDate,
          companyCode: freight.companyCode,
          negotiatedFreightPrice,
          purchaseCattleOrderId: freight.purchaseCattleOrderId,
          referenceFreightTablePrice,
        });
        cattlePurchaseFreightsOverTablePriceTotals.quantity += 1;
        cattlePurchaseFreightsOverTablePriceTotals.referenceFreightTablePrice +=
          referenceFreightTablePrice;
        cattlePurchaseFreightsOverTablePriceTotals.negotiatedFreightPrice +=
          negotiatedFreightPrice;
      }
    }

    // Estoque
    const stockIncomingBatches = await this.getStockIncomingBatches();

    const toExpiresStockMap = new Map<
      string,
      {
        dueDate: Date;
        companyCode: string;
        productCode: string;
        productName: string;
        totalWeightInKg: number;
        daysToExpires: number;
      }
    >();

    const toExpiresStockTotals = {
      totalWeightInKg: 0,
      daysToExpires: 0, // média final, calculada ao final
    };

    let daysToExpiresSum = 0;
    for (const batch of stockIncomingBatches) {
      if (!batch.productCode) {
        continue;
      }

      const currentDaysToExpires = dateFns.differenceInDays(
        batch.dueDate,
        new Date(),
      );

      if (currentDaysToExpires > 30) {
        continue;
      }

      const key = batch.productCode
        .concat('@')
        .concat(DateUtils.format(batch.dueDate, 'international-date'));

      const previous = toExpiresStockMap.get(key);

      const data = {
        dueDate: batch.dueDate,
        productCode: batch.productCode,
        companyCode: batch.companyCode,
        productName: batch.productName,
        totalWeightInKg: batch.weightInKg,
        daysToExpires: currentDaysToExpires,
      };

      if (previous) {
        data.totalWeightInKg += previous.totalWeightInKg;
      }

      toExpiresStockMap.set(key, data);

      // Totais acumulados
      toExpiresStockTotals.totalWeightInKg += batch.weightInKg;
      daysToExpiresSum += currentDaysToExpires;
    }

    if (toExpiresStockTotals.totalWeightInKg > 0) {
      toExpiresStockTotals.daysToExpires =
        daysToExpiresSum / stockIncomingBatches.length;
    }

    // Totais
    return new GetBusinessAuditResumeDataResponseDto({
      invoicesWithSamePrice,
      invoicesWithSamePriceTotals,

      manuallyEnteredInvoicesByCompany: Object.fromEntries(
        manuallyEnteredInvoicesByCompanyMap,
      ),
      manuallyEnteredInvoicesByClient: Object.fromEntries(
        manuallyEnteredInvoicesByClientMap,
      ),
      manuallyEnteredInvoicesTotals,

      openCattlePurchaseFreightsTotals,
      openCattlePurchaseFreights,
      cattlePurchaseFreightsDuplicated,
      cattlePurchaseFreightsDuplicatedTotals,
      cattlePurchaseFreightsOverTablePrice,
      cattlePurchaseFreightsOverTablePriceTotals,

      toExpiresStock: Object.fromEntries(toExpiresStockMap),
      toExpiresStockTotals,
    });
  }

  // FETCH DE DADOS
  private async getInvoices({
    startDate,
    endDate,
  }: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<GetInvoicesItem[]> {
    const qb = this.datasource
      .createQueryBuilder()
      .select([
        'si."date"',
        'si.nf_type',
        'si.company_code',
        'sc.name AS company_name',
        'si.cfop_code',
        'si.cfop_description',
        'si.nf_number',
        'si.request_id',
        'si.client_code',
        'si.client_name',
        'si.product_code',
        'si.product_name',
        'si.box_amount',
        'si.weight_in_kg',
        'si.unit_price',
        'si.total_price',
      ])
      .from('sensatta_invoices', 'si')
      .leftJoin(
        'sensatta_companies',
        'sc',
        'sc.sensatta_code = si.company_code',
      );

    if (startDate) {
      qb.andWhere('si.date >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('si.date <= :endDate', { endDate });
    }

    const results = await qb.getRawMany();

    return results.map((i) => ({
      date: i.date,
      nfType: i.nf_type,
      companyCode: i.company_code,
      companyName: i.company_name,
      cfopCode: i.cfop_code,
      cfopDescription: i.cfop_description,
      nfNumber: i.nf_number,
      requestId: i.request_id,
      clientCode: i.client_code,
      clientName: i.client_name,
      productCode: i.product_code,
      productName: i.product_name,
      boxAmount: i.box_amount,
      weightInKg: i.weight_in_kg,
      unitPrice: i.unit_price,
      totalPrice: i.total_price,
    }));
  }

  private async getManualInvoices({
    startDate,
    endDate,
  }: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<GetInvoicesItem[]> {
    const qb = this.datasource
      .createQueryBuilder()
      .select([
        'si."date"',
        'si.nf_type',
        'si.company_code',
        'sc.name AS company_name',
        'si.cfop_code',
        'si.cfop_description',
        'si.nf_number',
        'si.request_id',
        'si.client_code',
        'si.client_name',
        'si.product_code',
        'si.product_name',
        'si.box_amount',
        'si.weight_in_kg',
        'si.unit_price',
        'si.total_price',
      ])
      .from('sensatta_invoices', 'si')
      .leftJoin(
        'sensatta_companies',
        'sc',
        'sc.sensatta_code = si.company_code',
      )
      .where('si.nf_type = :nfType', { nfType: 'AVULSA' });

    if (startDate) {
      qb.andWhere('si.date >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('si.date <= :endDate', { endDate });
    }

    const results = await qb.getRawMany();

    return results.map((i) => ({
      date: i.date,
      nfType: i.nf_type,
      companyCode: i.company_code,
      companyName: i.company_name,
      cfopCode: i.cfop_code,
      cfopDescription: i.cfop_description,
      nfNumber: i.nf_number,
      requestId: i.request_id,
      clientCode: i.client_code,
      clientName: i.client_name,
      productCode: i.product_code,
      productName: i.product_name,
      boxAmount: i.box_amount,
      weightInKg: i.weight_in_kg,
      unitPrice: i.unit_price,
      totalPrice: i.total_price,
    }));
  }

  private async getFreights({
    startDate,
    endDate,
  }: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<GetCattlePurchaseFreightsItem[]> {
    const qb = this.datasource
      .createQueryBuilder()
      .select([
        'scpf."slaughter_date"',
        'scpf.freight_closing_date',
        'scpf.purchase_cattle_order_id',
        'scpf.company_code',
        'sc."name"',
        'scpf.freight_company_code',
        'scpf.freight_company_name',
        'scpf.supplier_code',
        'scpf.supplier_name',
        'scpf.cattle_advisor_code',
        'scpf.cattle_advisor_name',
        'scpf.feedlot_id',
        'scpf.feedlot_name',
        'scpf.feedlot_km_distance',
        'scpf.negotiated_km_distance',
        'scpf.cattle_quantity',
        'scpf.reference_freight_table_price',
        'scpf.negotiated_freight_price',
        'scpf.freight_transport_plate',
        'scpf.freight_transport_type',
      ])
      .addSelect('sc."name"', 'company_name')
      .from('sensatta_cattle_purchase_freights', 'scpf')
      .leftJoin(
        'sensatta_companies',
        'sc',
        'sc.sensatta_code = scpf.company_code',
      );

    if (startDate) {
      qb.andWhere('scpf."slaughter_date" >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('scpf."slaughter_date" <= :endDate', { endDate });
    }

    const results = await qb.getRawMany();

    return results.map((i) => ({
      slaughterDate: i.slaughter_date,
      freightClosingDate: i.freight_closing_date,
      purchaseCattleOrderId: i.purchase_cattle_order_id,
      companyCode: i.company_code,
      companyName: i.name,
      freightCompanyCode: i.freight_company_code,
      freightCompanyName: i.freight_company_name,
      supplierCode: i.supplier_code,
      supplierName: i.supplier_name,
      cattleAdvisorCode: i.cattle_advisor_code,
      cattleAdvisorName: i.cattle_advisor_name,
      feedlotId: i.feedlot_id,
      feedlotName: i.feedlot_name,
      feedlotKmDistance: i.feedlot_km_distance,
      negotiatedKmDistance: i.negotiated_km_distance,
      cattleQuantity: i.cattle_quantity,
      referenceFreightTablePrice: i.reference_freight_table_price,
      negotiatedFreightPrice: i.negotiated_freight_price,
      freightTransportPlate: i.freight_transport_plate,
      freightTransportType: i.freight_transport_type,
    }));
  }

  private async getStockIncomingBatches(): Promise<
    GetStockIncomingBatchesItem[]
  > {
    const qb = this.datasource
      .createQueryBuilder()
      .select([
        'sc.sensatta_code AS "companyCode"',
        'sib.production_date AS "productionDate"',
        'sib.due_date AS "dueDate"',
        'sp.sensatta_code AS "productCode"',
        'sp.name AS "productName"',
        'sib.weight_in_kg AS "weightInKg"',
      ])
      .from('sensatta_warehouses', 'sw')
      .leftJoin(
        'sensatta_companies',
        'sc',
        'sc.sensatta_code = sw.company_code',
      )
      .leftJoin(
        'sensatta_incoming_batches',
        'sib',
        'sib.warehouse_code = sw.sensatta_code',
      )
      .leftJoin(
        'sensatta_products',
        'sp',
        'sp.sensatta_code = sib.product_code',
      )
      .leftJoin(
        'sensatta_product_lines',
        'spl',
        'spl.sensatta_code = sib.product_line_code',
      )
      .where('sw.is_considered_on_stock = true');

    const results = await qb.getRawMany();

    return results.map((i) => ({
      companyCode: i.companyCode,
      productionDate: i.productionDate,
      dueDate: i.dueDate,
      productCode: i.productCode,
      productName: i.productName,
      weightInKg: i.weightInKg,
    }));
  }

  // METODOS AUXILIARES
  private getManuallyEnteredInvoicesByKey(
    key: keyof GetInvoicesItem,
    invoices: GetInvoicesItem[],
  ): Map<
    string,
    {
      quantity: number;
      productQuantity: number;
      weightInKg: number;
      totalPrice: number;
    }
  > {
    const data: Record<
      string,
      {
        quantity: number;
        productQuantity: number;
        weightInKg: number;
        totalPrice: number;
      }
    > = {};

    const map = new Map<string, Set<string>>();

    for (const invoice of invoices) {
      const entityKey = invoice[key] as string;
      const nfNumber = invoice.nfNumber;

      if (!data[entityKey]) {
        data[entityKey] = {
          quantity: 0,
          productQuantity: 0,
          weightInKg: 0,
          totalPrice: 0,
        };
      }

      data[entityKey].productQuantity += 1;
      data[entityKey].weightInKg += invoice.weightInKg;
      data[entityKey].totalPrice += invoice.totalPrice;

      if (!map.has(entityKey)) {
        map.set(entityKey, new Set());
      }
      map.get(entityKey)!.add(nfNumber);
    }

    // Atualiza as quantidades únicas de NFs
    for (const [entityKey, nfSet] of map.entries()) {
      data[entityKey].quantity = nfSet.size;
    }

    // Converte para Map antes de retornar
    const result = new Map<string, (typeof data)[string]>();
    for (const [key, value] of Object.entries(data)) {
      result.set(key, value);
    }

    return result;
  }

  // todo:
  private getInvoicesWithWeightInconsistences(invoices: GetInvoicesItem[]) {
    return invoices.filter((i) => i.weightInKg);
  }

  // todo:
  private getInvoicesWithSamePrice(invoices: GetInvoicesItem[]) {
    // tenho que receber as nfs agrupadas por n°
    const groupedInvoicesMap = new Map<string, GetInvoicesItem>();
    for (const invoice of invoices) {
      const key = invoice.nfNumber;
      if (!groupedInvoicesMap.has(key)) {
        groupedInvoicesMap.set(key, {
          ...invoice,
          boxAmount: 0,
          weightInKg: 0,
          totalPrice: 0,
        });
      }
      const group = groupedInvoicesMap.get(key)!;
      group.boxAmount += invoice.boxAmount;
      group.weightInKg = NumberUtils.nb2(group.weightInKg + invoice.weightInKg);
      group.totalPrice = NumberUtils.nb2(group.totalPrice + invoice.totalPrice);
    }

    const groupedInvoices = Array.from(groupedInvoicesMap.values());

    // faço o agrupamento das nfs com o valor e data iguais
    const groupedInvoicesByDateAndPriceMap = new Map<
      string,
      GetInvoicesItem[]
    >();
    for (const invoice of groupedInvoices) {
      const dateKey = invoice.date.toISOString().split('T')[0];
      const priceKey = invoice.totalPrice;

      const key = `${dateKey}|${priceKey}`;

      if (!groupedInvoicesByDateAndPriceMap.has(key)) {
        groupedInvoicesByDateAndPriceMap.set(key, []);
      }

      groupedInvoicesByDateAndPriceMap.get(key)!.push(invoice);
    }

    // depois de ver as nfs agrupadas, vejo quais datas tem mais de 1 registro
    const duplicatedInvoices: GetInvoicesItem[] = [];

    for (const group of groupedInvoicesByDateAndPriceMap.values()) {
      if (group.length > 1) {
        duplicatedInvoices.push(...group);
      }
    }

    return duplicatedInvoices.map((i) => ({
      date: i.date,
      nfNumber: i.nfNumber,
      companyCode: i.companyCode,
      companyName: i.companyName,
      clientCode: i.clientCode,
      clientName: i.clientName,
      totalPrice: i.totalPrice,
    }));
  }

  private getDuplicatedFreightsByDateAndPlate(
    freights: GetCattlePurchaseFreightsItem[],
  ) {
    const grouped = new Map<string, GetCattlePurchaseFreightsItem[]>();

    for (const freight of freights) {
      // Garantimos que tenha data e placa válida
      if (!freight.slaughterDate || !freight.freightTransportPlate?.trim()) {
        continue;
      }

      const dateKey = freight.slaughterDate.toISOString().split('T')[0];
      const plateKey = freight.freightTransportPlate.trim().toUpperCase();
      const key = `${dateKey}|${plateKey}`;

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }

      grouped.get(key)!.push(freight);
    }

    const duplicatedFreights: GetCattlePurchaseFreightsItem[] = [];

    for (const group of grouped.values()) {
      if (group.length > 1) {
        duplicatedFreights.push(...group);
      }
    }

    return duplicatedFreights.map((i) => ({
      date: i.slaughterDate,
      companyCode: i.companyCode,
      purchaseCattleOrderId: i.purchaseCattleOrderId,
      freightTransportPlate: i.freightTransportPlate,
      cattleQuantity: i.cattleQuantity,
    }));
  }

  private getOpenCattlePurchaseFreights(
    freights: GetCattlePurchaseFreightsItem[],
  ) {
    return freights
      .filter((i) => i.freightClosingDate === null)
      .filter((i) => !StringUtils.ILike(i.freightTransportType, '%SEM FRETE%'));
  }
}
