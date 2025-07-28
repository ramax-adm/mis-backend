// src/auth/guards/api-key.guard.ts
import { EnvService } from '@/config/env/env.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST }) // permite injeções personalizadas por requisição
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly envService: EnvService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKeyReceived = request.headers['x-api-key'];
    const apiKey = this.envService.get('BE_API_KEY');

    if (apiKeyReceived !== apiKey) {
      throw new UnauthorizedException('API key inválida');
    }

    return true;
  }
}
