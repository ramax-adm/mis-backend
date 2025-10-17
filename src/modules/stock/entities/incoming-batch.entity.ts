import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * 
-- EST 03 -> PARA PRODUTOS DE GUARANTÃ - MT
SELECT 
    LE.DATA_PRODUCAO,
    LE.DATA_ABATE,
    LE.DATA_IMPRESSA,
    LE.DATA_VALIDADE,
    TM.DESCRICAO AS TIPO_MOVIMENTACAO,
    EMP.CODIGO_EMPRESA,
    L.CODIGO_LINHA,
    P.CODIGO_PRODUTO,
    LE.CODIGO_ALMOXARIFADO,
    COUNT(*) AS CAIXAS,
    SUM(LE.QUANTIDADE) AS PCS,
    SUM(LE.PESO) AS PESO_TOTAL
    
FROM sigma_pcp.lote_entrada LE
JOIN SIGMA_MAT.ALMOXARIFADO AM ON LE.CODIGO_ALMOXARIFADO = AM.CODIGO_ALMOXARIFADO
JOIN SIGMA_MAT.TIPO_MOVIMENTACAO TM ON LE.TIPO_MOVIMENTO = TM.CODIGO_TIPO_MOVIMENTACAO
JOIN sigma_fis.empresa EMP ON AM.CODIGO_EMPRESA = EMP.codigo_empresa
JOIN SIGMA_VEN.PRODUTO P ON LE.SEQUENCIAL_PRODUTO = P.SEQUENCIAL_PRODUTO
JOIN SIGMA_VEN.LINHA L ON P.SEQUENCIAL_LINHA = L.SEQUENCIAL_LINHA
      

WHERE LE.EXPEDIDO = 0
  AND LE.CANCELADO = 0 
GROUP BY 
    LE.DATA_PRODUCAO,
    LE.DATA_ABATE,
    LE.DATA_IMPRESSA,
    LE.DATA_VALIDADE,
    TM.DESCRICAO,
    EMP.CODIGO_EMPRESA,
    L.CODIGO_LINHA,
    P.CODIGO_PRODUTO,
    LE.CODIGO_ALMOXARIFADO;

 */

@Entity({ name: 'sensatta_incoming_batches' })
export class IncomingBatches {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'production_date', type: 'date',nullable:true})
  productionDate: Date; // ok

  @Column({ name: 'slaughter_date', type: 'date',nullable:true})
  slaughterDate: Date;

  @Column({ name: 'print_date', type: 'date',nullable:true })
  printDate: Date; // ok

  @Column({ name: 'due_date', type: 'date',nullable:true })
  dueDate: Date; // ok
  
  @Column({ name: 'movement_type' })
  movementType: string; // ok

  @Column({name:'company_code'})
  companyCode:string // ok

  @Column({ name: 'product_line_code' })
  productLineCode: string; // ok

  @Column({ name: 'product_code' })
  productCode: string; // ok

  @Column({ name: 'warehouse_code' })
  warehouseCode: string;

  @Column({ name: 'box_amount', type: 'float4' })
  boxAmount: number; // ok

  @Column({ type: 'int4' })
  quantity: number; // ok

  @Column({ name: 'weight_in_kg', type: 'float4' })
  weightInKg: number; // ok

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
