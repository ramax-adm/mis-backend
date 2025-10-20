import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'sensatta_cattle_purchases' })
export class CattlePurchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sensatta_id', nullable: true })
  sensattaId: string;

  @Column({ name: 'slaughter_date', type: 'date', nullable: true })
  slaughterDate: Date;

  @Column({ name: 'cattle_owner_code', nullable: true })
  cattleOwnerCode: string;

  @Column({ name: 'cattle_owner_name', nullable: true })
  cattleOwnerName: string;

  @Column({ name: 'company_code', nullable: true })
  companyCode: string;

  @Column({ name: 'company_name', nullable: true })
  companyName: string;

  @Column({ name: 'cattle_advisor_code', nullable: true })
  cattleAdvisorCode: string;

  @Column({ name: 'cattle_advisor_name', nullable: true })
  cattleAdvisorName: string;

  @Column({ name: 'cattle_quantity', nullable: true })
  cattleQuantity: number;

  @Column({ name: 'cattle_classification', nullable: true })
  cattleClassification: string;

  //@Column({name:'',nullable:true})
  //weight: string;

  @Column({ name: 'weighing_type', type: 'varchar', nullable: true })
  weighingType: string;

  @Column({ name: 'cattle_weight_in_arroba', type: 'float4', nullable: true })
  cattleWeightInArroba: number;

  @Column({ name: 'balance_weight_in_kg', type: 'float4', nullable: true })
  balanceWeightInKg: number;

  @Column({ name: 'payment_term_in_days', type: 'int', nullable: true })
  paymentTerm: number;

  @Column({ name: 'freight_price', type: 'float4', nullable: true })
  freightPrice: number;

  @Column({ name: 'funrural_price', type: 'float4', nullable: true })
  funruralPrice: number;

  @Column({ name: 'purchase_price', type: 'float4', nullable: true })
  purchasePrice: number;

  @Column({ name: 'purchase_liquid_price', type: 'float4', nullable: true })
  purchaseLiquidPrice: number;

  @Column({ name: 'commission_price', type: 'float4', nullable: true })
  commissionPrice: number;

  @Column({ name: 'total_value', type: 'float4', nullable: true })
  totalValue: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
