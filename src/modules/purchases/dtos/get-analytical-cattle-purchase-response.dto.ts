import { DateUtils } from '@/modules/utils/services/date.utils';
import { NumberUtils } from '@/modules/utils/services/number.utils';
import * as dateFns from 'date-fns';

export interface GetAnalyticalCattlePurchaseResponseInput {
  slaughterDate: Date;
  sensattaId: string;
  cattleOwnerCode: string;
  cattleOwnerName: string;
  companyCode: string;
  companyName: string;
  cattleAdvisorCode: string;
  cattleAdvisorName: string;
  cattleQuantity: number;
  cattleClassification: string;
  cattleWeightInArroba: number;
  paymentTerm: number;
  freightPrice: number;
  purchasePrice: number;
  commissionPrice: number;
  totalValue: number;
  arrobaPrice: number;
  headPrice: number;
  kgPrice: number;
}

export class GetAnalyticalCattlePurchaseResponseDto {
  slaughterDate: Date;
  purchaseCattleOrderId: string;
  cattleOwnerCode: string;
  cattleOwnerName: string;
  companyCode: string;
  companyName: string;
  cattleAdvisorCode: string;
  cattleAdvisorName: string;
  cattleQuantity: number;
  cattleClassification: string;
  cattleWeightInArroba: number;
  paymentTerm: number;
  freightPrice: number;
  purchasePrice: number;
  commissionPrice: number;
  totalValue: number;
  arrobaPrice: number;
  headPrice: number;
  kgPrice: number;

  constructor(data: GetAnalyticalCattlePurchaseResponseInput) {
    Object.assign(this, {
      slaughterDate: data.slaughterDate,
      purchaseCattleOrderId: data.sensattaId,
      cattleOwnerCode: data.cattleOwnerCode,
      cattleOwnerName: data.cattleOwnerName,
      companyCode: data.companyCode,
      companyName: data.companyName,
      cattleAdvisorCode: data.cattleAdvisorCode,
      cattleAdvisorName: data.cattleAdvisorName,
      cattleQuantity: data.cattleQuantity,
      cattleClassification: data.cattleClassification,
      cattleWeightInArroba: data.cattleWeightInArroba,
      paymentTerm: data.paymentTerm,
      freightPrice: data.freightPrice,
      purchasePrice: data.purchasePrice,
      commissionPrice: data.commissionPrice,
      totalValue: data.totalValue,
      arrobaPrice: data.arrobaPrice,
      headPrice: data.headPrice,
      kgPrice: data.kgPrice,
    });
  }

  static create(data: GetAnalyticalCattlePurchaseResponseInput) {
    return new GetAnalyticalCattlePurchaseResponseDto(data);
  }

  toJSON() {
    const parsedSlaughterDate = dateFns.addHours(this.slaughterDate, 3);
    return {
      slaughterDate: DateUtils.format(parsedSlaughterDate, 'date'),
      purchaseCattleOrderId: this.purchaseCattleOrderId,
      cattleOwnerCode: this.cattleOwnerCode,
      cattleOwnerName: this.cattleOwnerName,
      companyCode: this.companyCode,
      companyName: this.companyName,
      cattleAdvisorCode: this.cattleAdvisorCode,
      cattleAdvisorName: this.cattleAdvisorName,
      cattleQuantity: this.cattleQuantity,
      cattleClassification: this.cattleClassification,
      cattleWeightInArroba: this.cattleWeightInArroba,
      paymentTerm: this.paymentTerm,
      freightPrice: NumberUtils.toLocaleString(this.freightPrice, 2),
      purchasePrice: NumberUtils.toLocaleString(this.purchasePrice, 2),
      commissionPrice: NumberUtils.toLocaleString(this.commissionPrice, 2),
      totalValue: NumberUtils.toLocaleString(this.totalValue, 2),
      arrobaPrice: NumberUtils.toLocaleString(this.arrobaPrice, 2),
      headPrice: NumberUtils.toLocaleString(this.headPrice, 2),
      kgPrice: NumberUtils.toLocaleString(this.kgPrice, 2),
    };
  }
}
