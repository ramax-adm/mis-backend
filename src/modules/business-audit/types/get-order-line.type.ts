import { OrderLine } from '@/modules/sales/entities/order-line.entity';

export type GetOrderLineItem = OrderLine & {
  additionPercent: number;
  discountPercent: number;
};
