import { UserAppWebpage } from '@/modules/user/entities/user-app-webpage.entity';
import { UserSensattaCompany } from '@/modules/user/entities/user-sensatta-company.entity';

export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  userCompanies: UserSensattaCompany[];
  userWebpages: UserAppWebpage[];
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
};
