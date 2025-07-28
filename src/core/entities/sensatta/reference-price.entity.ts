import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * QUERY SENSATTA
 * 
 * select 
      IP.SEQUENCIAL_ITEM_PRECO,
      IP.SEQUENCIAL_PRODUTO,
      TP.SEQUENCIAL_TABELA_PRECO,
      TP.CODIGO_EMPRESA,
      TP.NUMERO_TABELA,
      TP.DESCRICAO,
      IP.PRECO

  from SIGMA_VEN.ITEM_PRECO IP
  LEFT JOIN SIGMA_VEN.TABELA_PRECO TP ON TP.SEQUENCIAL_TABELA_PRECO = IP.SEQUENCIAL_TABELA_PRECO
 * 
 */
@Entity({ name: 'sensatta_reference_prices' })
export class ReferencePrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sensatta_id' })
  sensattaId: string; // sequencial item preco

  @Column({ name: 'product_id' })
  productId: string; // sequencial produto

  @Column({ name: 'main_price_table_id' })
  mainPriceTableId: string; // tabela preco -> sequencial tabela preco

  @Column({ name: 'company_code' })
  companyCode: string; // tabela preco -> codigo empresa

  @Column({ name: 'main_table_number' })
  mainTableNumber: string; // tabela preco -> numero tabela

  @Column({ name: 'main_description' })
  mainDescription: string; // tabela preco -> descricao

  @Column({ type: 'float4' })
  price: number; // preco

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
