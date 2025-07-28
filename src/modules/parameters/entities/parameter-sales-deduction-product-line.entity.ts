import { ProductLine } from '@/core/entities/sensatta/product-line.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ParameterSalesDeduction } from './parameter-sales-deduction.entity';

@Entity({ name: 'params_sales_deduction_product_lines' })
export class ParameterSalesDeductionProductLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_line_id' })
  productLineId: string;

  @ManyToOne(() => ProductLine, (item) => item.paramSaleDeductionProductLines)
  @JoinColumn({ name: 'product_line_id' })
  productLine: ProductLine;

  @Column({ name: 'param_sale_deduction_id' })
  paramSaleDeductionId: string;

  @ManyToOne(
    () => ParameterSalesDeduction,
    (item) => item.paramSaleDeductionProductLines,
  )
  @JoinColumn({ name: 'param_sale_deduction_id' })
  paramSaleDeduction: ParameterSalesDeduction;
}
