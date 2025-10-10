import { ApiKeyGuard } from '@/modules/auth/guards/api-key-guard';
import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiSecurity,
  ApiHeader,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SWAGGER_API_SECURITY } from '../constants/swagger-security';

/**
 * Aplica segurança baseada em API Key (header x-api-key)
 * e documenta automaticamente no Swagger.
 */
export function ApiKeyAuth(description?: string) {
  return applyDecorators(
    ApiSecurity(SWAGGER_API_SECURITY.API_KEY_AUTH),
    ApiHeader({
      name: 'x-api-key',
      description:
        description || 'Chave de acesso à API (fornecida pela administração).',
      required: true,
      schema: { type: 'string' },
    }),
    ApiUnauthorizedResponse({
      description: 'Chave da API invalida ou ausente.',
    }),
  );
}
