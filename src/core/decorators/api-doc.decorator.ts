import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

interface ApiControllerDocOptions {
  summary: string;
  description?: string;
  successStatus?: number;
  successDescription?: string;
  responses?: {
    [status: number]: string;
  };
}

export function ApiControllerDoc(options: ApiControllerDocOptions) {
  const {
    summary,
    description,
    successStatus = HttpStatus.OK,
    successDescription = 'Operação realizada com sucesso',
    responses = {},
  } = options;

  return applyDecorators(
    ApiOperation({ summary, description }),
    ApiResponse({ status: successStatus, description: successDescription }),

    // Responses genéricos (podem ser opcionais)
    ApiBadRequestResponse({
      description: 'Requisição mal-formada - Verifique os dados!',
    }),
    ApiUnauthorizedResponse({ description: 'Sem Autenticação' }),
    ApiForbiddenResponse({ description: 'Sem Autorização/Permissão' }),
    ApiInternalServerErrorResponse({ description: 'Erro Inesperado' }),

    // Respostas adicionais personalizadas
    ...Object.entries(responses).map(([status, desc]) =>
      ApiResponse({ status: +status, description: desc }),
    ),
  );
}
