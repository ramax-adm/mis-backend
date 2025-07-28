import { CashFlowProduct } from '../entities/cash-flow-product.entity';

export class MakeCashFlowProduct {
  static create(override: Partial<CashFlowProduct>): CashFlowProduct {
    return {
      id: '1',
      name: 'Acem',
      market: 'both',
      incomeKey: 'pAcem',
      quarterKey: 'dt',
      createdAt: new Date(),
      ...override,
    };
  }
}
