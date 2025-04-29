import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { PageMeta } from './page-meta';

export class Page<T> {
  @IsArray()
  @ApiProperty({ isArray: true })
  readonly data: T[];

  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly limit: number;

  @ApiProperty()
  readonly total: number;

  @ApiProperty()
  readonly pageCount: number;

  @ApiProperty()
  readonly hasPreviousPage: boolean;

  @ApiProperty()
  readonly hasNextPage: boolean;

  @ApiProperty()
  readonly lastPage: number;

  constructor(data: T[], meta: PageMeta) {
    this.data = data;
    this.page = meta.page;
    this.limit = meta.limit;
    this.total = meta.total;
    this.pageCount = meta.pageCount;
    this.hasPreviousPage = meta.hasPreviousPage;
    this.hasNextPage = meta.hasNextPage;
    this.lastPage = meta.lastPage;
  }
}
