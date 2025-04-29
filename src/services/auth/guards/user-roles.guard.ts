import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@/common/enums/user-role.enum';
import { RequestWithUser } from '@/common/decorators/current-user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequired = this.reflector.get<UserRole[]>(
      'roles',
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    console.log('\n==== RolesGuard ====');
    console.log('Roles Required', rolesRequired);
    console.log('Endpoint ', request.url);

    if (!rolesRequired || !rolesRequired.length) {
      return true;
    }

    const isUserAdmin = user.role === UserRole.Admin;
    const userHasRole = rolesRequired.includes(user.role);
    return isUserAdmin || userHasRole;
  }
}
