import { EntitiesEnum } from '../enums/entities.enum';

export const getSyncedFileEntityLabel = (entity: EntitiesEnum) => {
  const map = {
    [EntitiesEnum.CATTLE_PURCHASE]: 'Compra de gado',
    [EntitiesEnum.CATTLE_PURCHASE_FREIGHT]: 'Fretes de compra de gado',
    [EntitiesEnum.CLIENT]: 'Clientes',
    [EntitiesEnum.COMPANY]: 'Empresas',
    [EntitiesEnum.ENTITY]: 'Entidades',
    [EntitiesEnum.FREIGHT_COMPANY]: 'Transportadoras',
    [EntitiesEnum.INCOMING_BATCHES]: 'Estoque - Lote Entrada (EST-3)',
    [EntitiesEnum.INVENTORY]: 'Inventários',
    [EntitiesEnum.INVENTORY_BALANCE]: 'Inventário - Saldo Inventários',
    [EntitiesEnum.INVENTORY_ITEM_TRACEABILITY]:
      'Inventário - Rastreabilidade de Caixa',
    [EntitiesEnum.INVENTORY_ITEM]: 'Inventário - Caixas Inventariadas',
    [EntitiesEnum.INVOICE]: 'Notas Fiscais (Faturamento)',
    [EntitiesEnum.ORDER_LINE]: 'Pedidos - Item Pedido',
    [EntitiesEnum.PRODUCT]: 'Produtos',
    [EntitiesEnum.PRODUCT_LINE]: 'Produtos - Linha de produto',
    [EntitiesEnum.PRODUCTION_MOVEMENT]: 'Produção PCP (Entrada e Saída)',
    [EntitiesEnum.REFERENCE_PRICE]: 'Tabela de Preços',
    [EntitiesEnum.RETURN_OCCURRENCE]: 'Devoluções',
    [EntitiesEnum.STOCK_BALANCE]: 'Estoque - Saldo Estoque (EST-6)',
    [EntitiesEnum.WAREHOUSE]: 'Almoxarifados',
    [EntitiesEnum.ANTT_FREIGHT_COMPANY_CONSULTATION]:
      'Transportadora - Consulta ANTT',
    [EntitiesEnum.HOLIDAY]: 'Feriados',
  };

  return map[entity] ?? 'N/D';
};

// ✅ Corrigido e completo
export const SYNCED_FILE_ENTITIES = [
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.COMPANY),
    key: EntitiesEnum.COMPANY,
    value: EntitiesEnum.COMPANY,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.ENTITY),
    key: EntitiesEnum.ENTITY,
    value: EntitiesEnum.ENTITY,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.CLIENT),
    key: EntitiesEnum.CLIENT,
    value: EntitiesEnum.CLIENT,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.PRODUCT),
    key: EntitiesEnum.PRODUCT,
    value: EntitiesEnum.PRODUCT,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.PRODUCT_LINE),
    key: EntitiesEnum.PRODUCT_LINE,
    value: EntitiesEnum.PRODUCT_LINE,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.REFERENCE_PRICE),
    key: EntitiesEnum.REFERENCE_PRICE,
    value: EntitiesEnum.REFERENCE_PRICE,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.CATTLE_PURCHASE),
    key: EntitiesEnum.CATTLE_PURCHASE,
    value: EntitiesEnum.CATTLE_PURCHASE,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.CATTLE_PURCHASE_FREIGHT),
    key: EntitiesEnum.CATTLE_PURCHASE_FREIGHT,
    value: EntitiesEnum.CATTLE_PURCHASE_FREIGHT,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.FREIGHT_COMPANY),
    key: EntitiesEnum.FREIGHT_COMPANY,
    value: EntitiesEnum.FREIGHT_COMPANY,
  },
  {
    label: getSyncedFileEntityLabel(
      EntitiesEnum.ANTT_FREIGHT_COMPANY_CONSULTATION,
    ),
    key: EntitiesEnum.ANTT_FREIGHT_COMPANY_CONSULTATION,
    value: EntitiesEnum.ANTT_FREIGHT_COMPANY_CONSULTATION,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.INCOMING_BATCHES),
    key: EntitiesEnum.INCOMING_BATCHES,
    value: EntitiesEnum.INCOMING_BATCHES,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.WAREHOUSE),
    key: EntitiesEnum.WAREHOUSE,
    value: EntitiesEnum.WAREHOUSE,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.STOCK_BALANCE),
    key: EntitiesEnum.STOCK_BALANCE,
    value: EntitiesEnum.STOCK_BALANCE,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.INVENTORY),
    key: EntitiesEnum.INVENTORY,
    value: EntitiesEnum.INVENTORY,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.INVENTORY_ITEM),
    key: EntitiesEnum.INVENTORY_ITEM,
    value: EntitiesEnum.INVENTORY_ITEM,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.INVENTORY_ITEM_TRACEABILITY),
    key: EntitiesEnum.INVENTORY_ITEM_TRACEABILITY,
    value: EntitiesEnum.INVENTORY_ITEM_TRACEABILITY,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.INVENTORY_BALANCE),
    key: EntitiesEnum.INVENTORY_BALANCE,
    value: EntitiesEnum.INVENTORY_BALANCE,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.PRODUCTION_MOVEMENT),
    key: EntitiesEnum.PRODUCTION_MOVEMENT,
    value: EntitiesEnum.PRODUCTION_MOVEMENT,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.ORDER_LINE),
    key: EntitiesEnum.ORDER_LINE,
    value: EntitiesEnum.ORDER_LINE,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.INVOICE),
    key: EntitiesEnum.INVOICE,
    value: EntitiesEnum.INVOICE,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.RETURN_OCCURRENCE),
    key: EntitiesEnum.RETURN_OCCURRENCE,
    value: EntitiesEnum.RETURN_OCCURRENCE,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.HOLIDAY),
    key: EntitiesEnum.HOLIDAY,
    value: EntitiesEnum.HOLIDAY,
  },
];
