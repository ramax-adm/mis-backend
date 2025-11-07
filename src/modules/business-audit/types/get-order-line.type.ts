import { OrderLine } from '@/modules/sales/entities/order-line.entity';

export type GetOrderLineItem = OrderLine & {
  city: string;
  uf: string;
  tableValue: number;
  invoicingValue: number;
  dif: number;
  difPercent: number;
  additionPercent: number;
  discountPercent: number;
};
