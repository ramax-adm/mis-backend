import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { UserRole } from '@/common/enums/user-role.enum';

export const Roles = (...roles: UserRole[]): CustomDecorator<string> => {
  return SetMetadata('roles', roles);
};
