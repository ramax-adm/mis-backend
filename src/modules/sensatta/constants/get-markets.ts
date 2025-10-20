import { MarketEnum } from '@/modules/stock/enums/markets.enum';

export const getMarketLabel = (entity: MarketEnum) => {
  const map = {
    [MarketEnum.BOTH]: 'Ambos',
    [MarketEnum.ME]: 'ME',
    [MarketEnum.MI]: 'MI',
  };

  return map[entity] ?? 'N/D';
};

export const MARKETS = [
  {
    label: getMarketLabel(MarketEnum.BOTH),
    key: MarketEnum.BOTH,
    value: MarketEnum.BOTH,
  },
  {
    label: getMarketLabel(MarketEnum.ME),
    key: MarketEnum.ME,
    value: MarketEnum.ME,
  },
  {
    label: getMarketLabel(MarketEnum.MI),
    key: MarketEnum.MI,
    value: MarketEnum.MI,
  },
];
