import { EntitiesEnum } from '../enums/entities.enum';

export const getSyncedFileEntityLabel = (entity: EntitiesEnum) => {
  const map = {
    [EntitiesEnum.COMPANY]: 'Empresa',
    [EntitiesEnum.PRODUCT]: 'Produtos',
    [EntitiesEnum.CLIENT]: 'Clientes',
    [EntitiesEnum.CATTLE_PURCHASE]: 'Compra de gado',
    [EntitiesEnum.INCOMING_BATCHES]: 'Estoque - Lote Entrada (EST-3)',
    [EntitiesEnum.STOCK_BALANCE]: 'Estoque - Saldo Estoque (EST-6)',
    [EntitiesEnum.PRODUCTION_MOVEMENT]: 'Produção PCP (Entrada e Saida)',
    [EntitiesEnum.INVOICE]: 'Notas Fiscais (Faturamento)',
    [EntitiesEnum.RETURN_INVOICE]: 'Notas Fiscais (Devoluções)',
  };

  return map[entity] ?? 'N/D';
};

export const SYNCED_FILE_ENTITIES = [
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.COMPANY),
    key: EntitiesEnum.COMPANY,
    value: EntitiesEnum.COMPANY,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.PRODUCT),
    key: EntitiesEnum.PRODUCT,
    value: EntitiesEnum.PRODUCT,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.CLIENT),
    key: EntitiesEnum.CLIENT,
    value: EntitiesEnum.CLIENT,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.CATTLE_PURCHASE),
    key: EntitiesEnum.CATTLE_PURCHASE,
    value: EntitiesEnum.CATTLE_PURCHASE,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.INCOMING_BATCHES),
    key: EntitiesEnum.INCOMING_BATCHES,
    value: EntitiesEnum.INCOMING_BATCHES,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.STOCK_BALANCE),
    key: EntitiesEnum.STOCK_BALANCE,
    value: EntitiesEnum.STOCK_BALANCE,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.PRODUCTION_MOVEMENT),
    key: EntitiesEnum.PRODUCTION_MOVEMENT,
    value: EntitiesEnum.PRODUCTION_MOVEMENT,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.INVOICE),
    key: EntitiesEnum.INVOICE,
    value: EntitiesEnum.INVOICE,
  },
  {
    label: getSyncedFileEntityLabel(EntitiesEnum.RETURN_INVOICE),
    key: EntitiesEnum.RETURN_INVOICE,
    value: EntitiesEnum.RETURN_INVOICE,
  },
];
