import { PageOptions } from '@/core/paginate';
import { FindOptionsOrder, FindOptionsWhere } from 'typeorm';

export type FindAllParamsDto<Entity> = {
  where?: FindOptionsWhere<Entity>;
  pageOptions?: PageOptions;
};
export type FindAllNoPaginationParamsDto<Entity> = {
  where?: FindOptionsWhere<Entity>;
  order?: FindOptionsOrder<Entity>;
};
