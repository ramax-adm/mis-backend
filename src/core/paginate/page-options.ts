import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PageOptions {
  @ApiPropertyOptional({
    description: 'Campo para ordenação dos resultados.',
    default: 'createdAt',
  })
  @IsOptional()
  readonly orderBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Direção da ordenação.',
    enum: Order,
    default: Order.DESC,
  })
  @IsOptional()
  readonly order?: Order = Order.ASC;

  @ApiPropertyOptional({
    description: 'Número da página a ser retornada.',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'page deve ser um número inteiro' })
  @Min(1, { message: 'page deve ser no mínimo 1' })
  @IsOptional()
  readonly page?: number = 1;

  @ApiPropertyOptional({
    description: 'Quantidade de itens por página.',
    minimum: 1,
    maximum: 15000,
    default: 1000,
    example: 10,
  })
  @Type(() => Number)
  @IsInt({ message: 'limit deve ser um número inteiro' })
  @Min(1, { message: 'limit deve ser no mínimo 1' })
  @Max(15000, { message: 'limit deve ser no máximo 15000' })
  @IsOptional()
  readonly limit?: number = 1000;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}

export type PageOptionsParams = {
  page: number;
  limit?: number;
};
