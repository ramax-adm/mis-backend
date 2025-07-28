import { TipoArrendEnum } from '../enums/tipo-arrend.enum';

export const TIPOS_ARREND = [
  {
    label: 'KG Entrada',
    value: TipoArrendEnum.KG_ENTRADA,
  },
  {
    label: 'KG Saída',
    value: TipoArrendEnum.KG_SAIDA,
  },
];

export const getTipoArrend = (tipo: string) =>
  TIPOS_ARREND.find((item) => item.value === tipo).label;
