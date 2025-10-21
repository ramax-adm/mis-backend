import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { ContentObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

interface ApiControllerDocOptions {
  summary: string;
  description?: string;
  successStatus?: number;
  successDescription?: string;
  successType?: Type<unknown>;
  successContentType?: ContentObject;
  responses?: {
    [status: number]: {
      description: string;
      type: Type<unknown>;
    };
  };
}

export function ApiControllerDoc(options: ApiControllerDocOptions) {
  const {
    summary,
    description,
    successStatus = HttpStatus.OK,
    successDescription = 'Operação realizada com sucesso',
    successType,
    successContentType,
    responses = {},
  } = options;

  return applyDecorators(
    ApiOperation({ summary, description }),
    ApiResponse({
      status: successStatus,
      description: successDescription,
      ...(successType && { type: successType }),
      content: successContentType,
    }),

    // Responses genéricos (podem ser opcionais)
    ApiBadRequestResponse({
      description: 'Requisição mal-formada',
    }),
    ApiUnauthorizedResponse({ description: 'Sem Autenticação' }),
    ApiForbiddenResponse({ description: 'Sem Autorização/Permissão' }),
    ApiInternalServerErrorResponse({ description: 'Erro Inesperado' }),

    // Respostas adicionais personalizadas
    ...Object.entries(responses).map(([status, { description, type }]) =>
      ApiResponse({ status: +status, description, ...(type && { type }) }),
    ),
  );
}
