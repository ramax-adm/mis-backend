import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'sensatta_cattle_purchase_freights' })
export class CattlePurchaseFreight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'slaughter_date', type: 'date', nullable: true })
  slaughterDate: Date;

  @Column({ name: 'freight_closing_date', type: 'date', nullable: true })
  freightClosingDate: Date | null;

  @Column({ name: 'purchase_cattle_order_id', nullable: true })
  purchaseCattleOrderId: string;

  @Column({ name: 'company_code', nullable: true })
  companyCode: string;

  @Column({ name: 'freight_company_code', nullable: true })
  freightCompanyCode: string;

  @Column({ name: 'freight_company_name', nullable: true })
  freightCompanyName: string;

  @Column({ name: 'supplier_code', nullable: true })
  supplierCode: string;

  @Column({ name: 'supplier_name', nullable: true })
  supplierName: string;

  @Column({ name: 'cattle_advisor_code', nullable: true })
  cattleAdvisorCode: string;

  @Column({ name: 'cattle_advisor_name', nullable: true })
  cattleAdvisorName: string;

  @Column({ name: 'freight_transport_type', nullable: true })
  freightTransportType: string;

  @Column({ name: 'freight_transport_plate', nullable: true })
  freightTransportPlate: string;

  @Column({ name: 'origin_city', nullable: true })
  originCity: string;

  @Column({ name: 'feedlot_id', nullable: true })
  feedlotId: string;

  @Column({ name: 'feedlot_name', nullable: true })
  feedlotName: string;

  @Column({ name: 'feedlot_km_distance', type: 'float4', nullable: true })
  feedlotKmDistance: number;

  @Column({ name: 'negotiated_km_distance', type: 'float4', nullable: true })
  negotiatedKmDistance: number;

  @Column({ name: 'cattle_quantity', type: 'int', nullable: true })
  cattleQuantity: number;

  // @Column({ name: 'nf_cattle_quantity', type: 'int', nullable: true })
  // nfCattleQuantity: number;

  @Column({
    name: 'reference_freight_table_price',
    type: 'float4',
    nullable: true,
  })
  referenceFreightTablePrice: number;

  @Column({ name: 'negotiated_freight_price', type: 'float4', nullable: true })
  negotiatedFreightPrice: number;

  // @Column({ name: 'nf_freight_price', type: 'float4', nullable: true })
  // nfFreightPrice: number;

  @Column({ name: 'entry_nf', nullable: true })
  entryNf: string;

  @Column({ name: 'complement_nf', nullable: true })
  complementNf: string;

  @Column({ name: 'nf_type', nullable: true })
  nfType: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
