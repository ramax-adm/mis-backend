import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from '../user';

export interface RequestWithUser extends Request {
  user: User;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    return request.user;
  },
);
