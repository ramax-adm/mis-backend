import { UserRole } from '@/core/enums/user-role.enum';

export const USER_DEPARTMENTS = [
  {
    label: 'Admin',
    value: UserRole.Admin,
    key: UserRole.Admin,
  },
  {
    label: 'Diretoria',
    value: UserRole.Directory,
    key: UserRole.Directory,
  },
  {
    label: 'Financeiro',
    value: UserRole.Financial,
    key: UserRole.Financial,
  },
  {
    label: 'Comercial',
    value: UserRole.Commercial,
    key: UserRole.Commercial,
  },
  {
    label: 'Industria',
    value: UserRole.Industry,
    key: UserRole.Industry,
  },
  {
    label: 'Contabilidade',
    value: UserRole.Accounting,
    key: UserRole.Accounting,
  },
  {
    label: 'Marketing',
    value: UserRole.Marketing,
    key: UserRole.Marketing,
  },
  {
    label: 'Administrativo',
    value: UserRole.Administrative,
    key: UserRole.Administrative,
  },
  {
    label: 'TI',
    value: UserRole.Tecnology,
    key: UserRole.Tecnology,
  },
  {
    label: 'Risco',
    value: UserRole.Risk,
    key: UserRole.Risk,
  },
  {
    label: 'Outros',
    value: UserRole.Other,
    key: UserRole.Other,
  },
];
