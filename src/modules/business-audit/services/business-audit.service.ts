import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GetBusinessAuditResumeDataResponseDto } from '../dtos/response/get-business-resume-data-response.dto';
import { NumberUtils } from '@/modules/utils/services/number.utils';
import { StringUtils } from '@/modules/utils/services/string.utils';
import { GetFreightsItem } from '../types/get-freights.type';
import { DateUtils } from '@/modules/utils/services/date.utils';
import * as dateFns from 'date-fns';

@Injectable()
export class BusinessAuditService {
  constructor(private readonly datasource: DataSource) {}

  async getData({ startDate, endDate }: { startDate?: Date; endDate?: Date }) {
    // faturamento
    const manuallyEnteredInvoices = await this.getManualInvoices({
      startDate,
      endDate,
    });

    const manuallyEnteredInvoicesByCompanyMap = new Map<
      string,
      {
        quantity: number;
        weightInKg: number;
        totalPrice: number;
      }
    >();
    const manuallyEnteredInvoicesByClientMap = new Map<
      string,
      {
        quantity: number;
        weightInKg: number;
        totalPrice: number;
      }
    >();
    const manuallyEnteredInvoicesTotals = {
      quantity: 0,
      weightInKg: 0,
      totalPrice: 0,
    };

    for (const invoice of manuallyEnteredInvoices) {
      const { companyCode, companyName, clientName } = invoice;

      const payload = {
        quantity: 1,
        weightInKg: invoice.weightInKg,
        totalPrice: invoice.totalPrice,
      };

      // totals
      manuallyEnteredInvoicesTotals.quantity += payload.quantity;
      manuallyEnteredInvoicesTotals.weightInKg += payload.weightInKg;
      manuallyEnteredInvoicesTotals.totalPrice += payload.totalPrice;

      // by company
      if (!manuallyEnteredInvoicesByCompanyMap.has(companyCode)) {
        manuallyEnteredInvoicesByCompanyMap.set(companyCode, {
          quantity: 0,
          totalPrice: 0,
          weightInKg: 0,
        });
      }
      const previousInvoicesByCompanyMap =
        manuallyEnteredInvoicesByCompanyMap.get(companyCode)!;
      previousInvoicesByCompanyMap.quantity += payload.quantity;
      previousInvoicesByCompanyMap.weightInKg += payload.weightInKg;
      previousInvoicesByCompanyMap.totalPrice += payload.totalPrice;

      // by client
      if (!manuallyEnteredInvoicesByClientMap.has(clientName)) {
        manuallyEnteredInvoicesByClientMap.set(clientName, {
          quantity: 0,
          totalPrice: 0,
          weightInKg: 0,
        });
      }
      const previousInvoicesByClientMap =
        manuallyEnteredInvoicesByClientMap.get(clientName)!;
      previousInvoicesByClientMap.quantity += payload.quantity;
      previousInvoicesByClientMap.weightInKg += payload.weightInKg;
      previousInvoicesByClientMap.totalPrice += payload.totalPrice;
    }

    const cattlePurchaseFreights = await this.getFreights({
      startDate,
      endDate,
    });
    const openCattlePurchaseFreights = cattlePurchaseFreights
      .filter((i) => i.freightClosingDate === null)
      .filter((i) => !StringUtils.ILike(i.freightTransportType, '%SEM FRETE%'));

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

  // auxiliar methods

  // get open freights

  // outros metodos aqui

  async getManualInvoices({
    startDate,
    endDate,
  }: {
    startDate?: Date;
    endDate?: Date;
  }) {
    const query = this.datasource
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
      query.andWhere('si.date >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('si.date <= :endDate', { endDate });
    }

    const results = await query.getRawMany();

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

  async getFreights({
    startDate,
    endDate,
  }: {
    startDate?: Date;
    endDate?: Date;
  }) {
    const query = this.datasource
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
      query.andWhere('scpf."slaughter_date" >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('scpf."slaughter_date" <= :endDate', { endDate });
    }

    const results = await query.getRawMany();

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

  async getStockIncomingBatches() {
    const query = this.datasource
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

    const results = await query.getRawMany();

    return results.map((i) => ({
      companyCode: i.companyCode,
      productionDate: i.productionDate,
      dueDate: i.dueDate,
      productCode: i.productCode,
      productName: i.productName,
      weightInKg: i.weightInKg,
    }));
  }

  getDuplicatedFreightsByDateAndPlate(freights: GetFreightsItem[]) {
    const grouped = new Map<string, GetFreightsItem[]>();

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

    const duplicatedFreights: GetFreightsItem[] = [];

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
}
