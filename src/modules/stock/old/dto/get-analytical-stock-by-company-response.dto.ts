import { NumberUtils } from '@/modules/utils/services/number.utils';

export class GetAnalyticalStockByCompanyResponseDto {
  companyName: string;
  productLineAcronym: string;
  productLineCode: string;
  productLineName: string;
  productCode: string;
  productName: string;
  productClassification: string;
  boxAmount: number;
  quantity: number;
  totalWeightInKg: number;
  basePriceCar: number;
  basePriceTruck: number;
  totalPrice: number;

  // Truck
  priceSPTruck: number;
  priceRJTruck: number;
  pricePRTruck: number;
  priceSCTruck: number;
  priceMGTruck: number;
  priceBATruck: number;
  pricePETruck: number;
  pricePBTruck: number;
  priceRNTruck: number;
  priceGOTruck: number;
  priceDFTruck: number;
  priceFOTruck: number;
  priceRSTruck: number;
  priceMATruck: number;
  priceMTTruck: number;
  priceMSTruck: number;
  pricePATruck: number;
  priceESTruck: number;
  priceTOTruck: number;

  // Car
  priceSPCar: number;
  priceRJCar: number;
  pricePRCar: number;
  priceSCCar: number;
  priceMGCar: number;
  priceBACar: number;
  pricePECar: number;
  pricePBCar: number;
  priceRNCar: number;
  priceGOCar: number;
  priceDFCar: number;
  priceFOCar: number;
  priceRSCar: number;
  priceMACar: number;
  priceMTCar: number;
  priceMSCar: number;
  pricePACar: number;
  priceESCar: number;
  priceTOCar: number;

  constructor(data: GetAnalyticalStockByCompanyResponseDto) {
    Object.assign(this, data);
  }

  static create(data: GetAnalyticalStockByCompanyResponseDto) {
    return new GetAnalyticalStockByCompanyResponseDto(data);
  }

  static fromMap(
    map: Map<string, any>,
  ): GetAnalyticalStockByCompanyResponseDto[] {
    const result: GetAnalyticalStockByCompanyResponseDto[] = [];

    for (const [productCode, values] of map.entries()) {
      result.push(
        new GetAnalyticalStockByCompanyResponseDto({
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
      productLineCode: this.productLineCode,
      productLineName: this.productLineName,
      productCode: this.productCode,
      productName: this.productName,
      productClassification: this.productClassification,
      boxAmount: NumberUtils.toLocaleString(this.boxAmount ?? 0),
      quantity: NumberUtils.toLocaleString(this.quantity ?? 0),
      totalWeightInKg: NumberUtils.toLocaleString(this.totalWeightInKg ?? 0),
      basePriceCar: NumberUtils.toLocaleString(this.basePriceCar ?? 0, 2),
      basePriceTruck: NumberUtils.toLocaleString(this.basePriceTruck ?? 0, 2),
      totalPrice: NumberUtils.toLocaleString(this.totalPrice ?? 0),

      // Truck prices
      priceSPTruck: NumberUtils.toLocaleString(this.priceSPTruck ?? 0, 2),
      priceRJTruck: NumberUtils.toLocaleString(this.priceRJTruck ?? 0, 2),
      pricePRTruck: NumberUtils.toLocaleString(this.pricePRTruck ?? 0, 2),
      priceSCTruck: NumberUtils.toLocaleString(this.priceSCTruck ?? 0, 2),
      priceMGTruck: NumberUtils.toLocaleString(this.priceMGTruck ?? 0, 2),
      priceBATruck: NumberUtils.toLocaleString(this.priceBATruck ?? 0, 2),
      pricePETruck: NumberUtils.toLocaleString(this.pricePETruck ?? 0, 2),
      pricePBTruck: NumberUtils.toLocaleString(this.pricePBTruck ?? 0, 2),
      priceRNTruck: NumberUtils.toLocaleString(this.priceRNTruck ?? 0, 2),
      priceGOTruck: NumberUtils.toLocaleString(this.priceGOTruck ?? 0, 2),
      priceDFTruck: NumberUtils.toLocaleString(this.priceDFTruck ?? 0, 2),
      priceFOTruck: NumberUtils.toLocaleString(this.priceFOTruck ?? 0, 2),
      priceRSTruck: NumberUtils.toLocaleString(this.priceRSTruck ?? 0, 2),
      priceMATruck: NumberUtils.toLocaleString(this.priceMATruck ?? 0, 2),
      priceMTTruck: NumberUtils.toLocaleString(this.priceMTTruck ?? 0, 2),
      priceMSTruck: NumberUtils.toLocaleString(this.priceMSTruck ?? 0, 2),
      pricePATruck: NumberUtils.toLocaleString(this.pricePATruck ?? 0, 2),
      priceESTruck: NumberUtils.toLocaleString(this.priceESTruck ?? 0, 2),
      priceTOTruck: NumberUtils.toLocaleString(this.priceTOTruck ?? 0, 2),

      // Car prices
      priceSPCar: NumberUtils.toLocaleString(this.priceSPCar ?? 0, 2),
      priceRJCar: NumberUtils.toLocaleString(this.priceRJCar ?? 0, 2),
      pricePRCar: NumberUtils.toLocaleString(this.pricePRCar ?? 0, 2),
      priceSCCar: NumberUtils.toLocaleString(this.priceSCCar ?? 0, 2),
      priceMGCar: NumberUtils.toLocaleString(this.priceMGCar ?? 0, 2),
      priceBACar: NumberUtils.toLocaleString(this.priceBACar ?? 0, 2),
      pricePECar: NumberUtils.toLocaleString(this.pricePECar ?? 0, 2),
      pricePBCar: NumberUtils.toLocaleString(this.pricePBCar ?? 0, 2),
      priceRNCar: NumberUtils.toLocaleString(this.priceRNCar ?? 0, 2),
      priceGOCar: NumberUtils.toLocaleString(this.priceGOCar ?? 0, 2),
      priceDFCar: NumberUtils.toLocaleString(this.priceDFCar ?? 0, 2),
      priceFOCar: NumberUtils.toLocaleString(this.priceFOCar ?? 0, 2),
      priceRSCar: NumberUtils.toLocaleString(this.priceRSCar ?? 0, 2),
      priceMACar: NumberUtils.toLocaleString(this.priceMACar ?? 0, 2),
      priceMTCar: NumberUtils.toLocaleString(this.priceMTCar ?? 0, 2),
      priceMSCar: NumberUtils.toLocaleString(this.priceMSCar ?? 0, 2),
      pricePACar: NumberUtils.toLocaleString(this.pricePACar ?? 0, 2),
      priceESCar: NumberUtils.toLocaleString(this.priceESCar ?? 0, 2),
      priceTOCar: NumberUtils.toLocaleString(this.priceTOCar ?? 0, 2),
    };
  }
}
