import { PageOptions } from './page-options';

export interface PageMetaParameters {
  pageOptions: PageOptions;
  total: number;
}

export class PageMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly pageCount: number;
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;
  readonly lastPage: number;

  constructor({ pageOptions, total }: PageMetaParameters) {
    this.page = pageOptions.page;
    this.limit = pageOptions.limit;
    this.total = total;
    this.pageCount = Math.ceil(this.total / this.limit);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
    this.lastPage = total < this.limit ? 1 : Math.ceil(total / this.limit);
  }
}
