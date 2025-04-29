import { NumberUtils } from '@/services/utils/number.utils';

export class GetStockByCompanyResponseDto {
  companyName: string;
  productLineAcronym: string;
  productLineName: string;
  productCode: string;
  productName: string;
  productClassification: string;
  boxAmount: number;
  quantity: number;
  totalWeightInKg: number;
  basePrice: number;
  totalPrice: number;

  constructor(data: GetStockByCompanyResponseDto) {
    Object.assign(this, data);
  }

  static create(data: GetStockByCompanyResponseDto) {
    return new GetStockByCompanyResponseDto(data);
  }

  static fromMap(map: Map<string, any>): GetStockByCompanyResponseDto[] {
    const result: GetStockByCompanyResponseDto[] = [];

    for (const [productCode, values] of map.entries()) {
      result.push(
        new GetStockByCompanyResponseDto({
          productCode,
          ...values,
        }),
      );
    }

    return result;
  }

  toJSON() {
    return {
      companyName: this.companyName,
      productLineAcronym: this.productLineAcronym,
      productLineName: this.productLineName,
      productCode: this.productCode,
      productName: this.productName,
      productClassification: this.productClassification,
      boxAmount: NumberUtils.toLocaleString(this.boxAmount ?? 0),
      quantity: NumberUtils.toLocaleString(this.quantity ?? 0),
      totalWeightInKg: NumberUtils.toLocaleString(this.totalWeightInKg ?? 0),
      basePrice: NumberUtils.toLocaleString(this.basePrice ?? 0, 2),
      totalPrice: NumberUtils.toLocaleString(this.totalPrice ?? 0),
    };
  }
}
