import { DateUtils } from '@/modules/utils/services/date.utils';
import { NumberUtils } from '@/modules/utils/services/number.utils';
import * as dateFns from 'date-fns';

export interface GetAnalyticalCattlePurchaseFreightsResponseInput {
  slaughter_date: Date;
  receipt_date: Date;
  company_code: string;
  company_name: string;
  purchase_cattle_order_id: string;
  status: string;
  freight_company_name: string;
  supplier_name: string;
  cattle_advisor_name: string;
  freight_transport_plate: string;
  freight_transport_capacity: number;
  freight_transport_type: string;
  feedlot_name: string;
  feedlot_km_distance: number;
  negotiated_km_distance: number;
  cattle_quantity: number;
  reference_freight_table_price: number;
  road_price: number;
  earth_price: number;
  base_price: number;
  toll_price: number;
  additional_price: number;
  discount_price: number;
  negotiated_freight_price: number;
  dif_price: number;
  price_km: number;
  price_km_cattle_quantity: number;
  entry_nf: string;
  complement_nf: string;
  open_days?: number;
}

export class GetAnalyticalCattlePurchaseFreightsResponseDto {
  slaughterDate: Date;
  receiptDate: Date;
  companyCode: string;
  companyName: string;
  purchaseCattleOrderId: string;
  status: string;
  freightCompanyName: string;
  supplierName: string;
  cattleAdvisorName: string;
  freightTransportPlate: string;
  freightTransportType: string;
  freightTransportCapacity: number;
  feedlotName: string;
  feedlotKmDistance: number;
  negotiatedKmDistance: number;
  cattleQuantity: number;
  referenceFreightTablePrice: number;
  roadPrice: number;
  earthPrice: number;
  basePrice: number;
  tollPrice: number;
  additionalPrice: number;
  discountPrice: number;
  negotiatedFreightPrice: number;
  difPrice: number;
  priceKm: number;
  priceKmCattleQuantity: number;
  entryNf: string;
  complementNf: string;
  openDays: number;

  constructor(data: GetAnalyticalCattlePurchaseFreightsResponseInput) {
    Object.assign(this, {
      slaughterDate: data.slaughter_date,
      receiptDate: data.receipt_date,
      companyCode: data.company_code,
      companyName: data.company_name,
      purchaseCattleOrderId: data.purchase_cattle_order_id,
      status: data.status,
      freightCompanyName: data.freight_company_name,
      supplierName: data.supplier_name,
      cattleAdvisorName: data.cattle_advisor_name,
      freightTransportPlate: data.freight_transport_plate,
      freightTransportType: data.freight_transport_type,
      freightTransportCapacity: data.freight_transport_capacity,
      feedlotName: data.feedlot_name,
      feedlotKmDistance: data.feedlot_km_distance,
      negotiatedKmDistance: data.negotiated_km_distance,
      cattleQuantity: data.cattle_quantity,
      referenceFreightTablePrice: data.reference_freight_table_price,
      roadPrice: data.road_price,
      earthPrice: data.earth_price,
      basePrice: data.base_price,
      difPrice: data.dif_price,
      tollPrice: data.toll_price,
      additionalPrice: data.additional_price,
      discountPrice: data.discount_price,
      negotiatedFreightPrice: data.negotiated_freight_price,
      priceKm: data.price_km,
      priceKmCattleQuantity: data.price_km_cattle_quantity,
      entryNf: data.entry_nf,
      complementNf: data.complement_nf,
      openDays: data.open_days,
    });
  }

  static create(data: GetAnalyticalCattlePurchaseFreightsResponseInput) {
    return new GetAnalyticalCattlePurchaseFreightsResponseDto(data);
  }

  toJSON() {
    const parsedSlaughterDate = dateFns.addHours(this.slaughterDate, 3);
    const parsedReceiptDate = dateFns.addHours(this.receiptDate, 3);
    return {
      slaughterDate: DateUtils.format(parsedSlaughterDate, 'date'),
      receiptDate: DateUtils.format(parsedReceiptDate, 'date'),
      companyCode: this.companyCode,
      companyName: this.companyName,
      purchaseCattleOrderId: this.purchaseCattleOrderId,
      status: this.status,
      freightCompanyName: this.freightCompanyName,
      supplierName: this.supplierName,
      cattleAdvisorName: this.cattleAdvisorName,
      freightTransportPlate: this.freightTransportPlate,
      freightTransportType: this.freightTransportType,
      freightTransportCapacity: this.freightTransportCapacity,
      feedlotName: this.feedlotName,
      feedlotKmDistance: this.feedlotKmDistance,
      negotiatedKmDistance: this.negotiatedKmDistance,
      cattleQuantity: this.cattleQuantity,
      referenceFreightTablePrice: NumberUtils.toLocaleString(
        this.referenceFreightTablePrice,
      ),
      roadPrice: NumberUtils.toLocaleString(this.roadPrice),
      earthPrice: NumberUtils.toLocaleString(this.earthPrice),
      basePrice: NumberUtils.toLocaleString(this.basePrice),
      difPrice: NumberUtils.toLocaleString(this.difPrice),
      tollPrice: NumberUtils.toLocaleString(this.tollPrice),
      additionalPrice: NumberUtils.toLocaleString(this.additionalPrice),
      discountPrice: NumberUtils.toLocaleString(this.discountPrice),
      negotiatedFreightPrice: NumberUtils.toLocaleString(
        this.negotiatedFreightPrice,
      ),
      priceKm: NumberUtils.toLocaleString(this.priceKm),
      priceKmCattleQuantity: NumberUtils.toLocaleString(
        this.priceKmCattleQuantity,
      ),
      entryNf: this.entryNf,
      complementNf: this.complementNf,
      openDays: this.openDays,
    };
  }
}
