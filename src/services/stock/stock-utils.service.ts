import { Injectable } from '@nestjs/common';
import { PRICE_TABLE_MAP } from './constants/price-table-map';
import { GetIncomingBatchesQueryResponse } from './types/stock.types';

@Injectable()
export class StockUtilsService {
  constructor() {}

  getPriceMap(
    batch: GetIncomingBatchesQueryResponse,
    refPrices: {
      companyCode: string;
      productId: string;
      mainTableNumber: string;
      price: number;
    }[],
  ) {
    const priceMap: Record<string, number> = {};

    for (const [type, states] of Object.entries(PRICE_TABLE_MAP)) {
      for (const [uf, tableNumber] of Object.entries(states)) {
        const key = `price${uf}${type}`;
        priceMap[key] =
          refPrices.find(
            (item) =>
              item.productId == batch.productId &&
              item.mainTableNumber == tableNumber,
          )?.price ?? 0;
      }
    }

    return priceMap;
  }
}
