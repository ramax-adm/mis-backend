import {
  DeepPartial,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { BaseEntity } from '../entities/base-entity.entity';
import { NotFoundException } from '@nestjs/common';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Page, PageMeta, PageOptions } from '../paginate';
import {
  FindAllNoPaginationParamsDto,
  FindAllParamsDto,
} from '../types/find-all-params.type';

export abstract class CrudService<
  Entity extends BaseEntity,
  CreateInput extends DeepPartial<Entity> = DeepPartial<Entity>,
  UpdateInput extends DeepPartial<Entity> = DeepPartial<Entity>,
> {
  abstract resourceName: string;

  constructor(readonly repository: Repository<Entity>) {}

  async create(input: CreateInput): Promise<Entity> {
    return this.repository.save(input);
  }

  async update(input: UpdateInput): Promise<Entity> {
    const data = await this.repository.findOneBy({
      id: input.id,
    } as FindOptionsWhere<Entity>);

    if (!data) {
      throw new NotFoundException(`${this.resourceName} não encontrado.`);
    }

    Object.assign(data, input, {
      updatedBy: input.updatedBy,
    });
    return this.repository.save(data);
  }

  async findAll(params: FindAllParamsDto<Entity> = {}): Promise<Page<Entity>> {
    if (!params.pageOptions) {
      params.pageOptions = new PageOptions();
    }
    const { pageOptions, where = {} } = params;
    const [data, total] = await this.repository.findAndCount({
      where,
      order: {
        [pageOptions.orderBy]: pageOptions.order,
      } as FindOptionsOrder<Entity>,
      take: pageOptions.limit,
      skip: pageOptions.skip,
      relations: {},
    });

    const pageMeta = new PageMeta({ total, pageOptions });

    return new Page(data, pageMeta);
  }

  async findAllNoPagination(
    params: FindAllNoPaginationParamsDto<Entity> = {},
  ): Promise<Entity[]> {
    const { where, order } = params;
    return await this.repository.find({
      where,
      order,
    });
  }

  async findOne(id: string): Promise<Entity> {
    const data = await this.repository.findOneBy({
      id,
    } as FindOptionsWhere<Entity>);

    if (!data) {
      throw new NotFoundException(`${this.resourceName} não encontrado.`);
    }

    return data;
  }

  async delete(input: Pick<Entity, 'id' | 'deletedBy'>) {
    const { id, deletedBy } = input;
    const data = await this.repository.findOneBy({
      id,
    } as FindOptionsWhere<Entity>);

    if (!data) {
      throw new NotFoundException(`${this.resourceName} não encontrado.`);
    }

    await this.repository.softDelete({ id } as FindOptionsWhere<Entity>);
    await this.repository.update(
      { id } as FindOptionsWhere<Entity>,
      {
        deletedBy,
      } as unknown as QueryDeepPartialEntity<Entity>,
    );

    return {
      message: `${this.resourceName} excluido com sucesso.`,
    };
  }
}
