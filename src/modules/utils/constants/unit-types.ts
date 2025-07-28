import { UnitTypesEnum } from '../enums/unit-types.enum';

export const UNIT_TYPES = [
  {
    label: 'KGs',
    value: UnitTypesEnum.KG,
    key: UnitTypesEnum.KG,
  },
  {
    label: 'Moeda R$',
    value: UnitTypesEnum.MONEY,
    key: UnitTypesEnum.MONEY,
  },
  {
    label: 'Numero 0-9',
    value: UnitTypesEnum.NUMBER,
    key: UnitTypesEnum.NUMBER,
  },
  {
    label: 'Porcentagem - %',
    value: UnitTypesEnum.PERCENTAGE,
    key: UnitTypesEnum.PERCENTAGE,
  },
];
