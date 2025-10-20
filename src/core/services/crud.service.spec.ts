import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CrudService } from './crud.service';
import { BaseEntity } from '../entities/base-entity.entity';
import { Page, PageOptions } from '../paginate';
import { FindAllParamsDto } from '../types/find-all-params.type';
import { randomUUID } from 'crypto';
import { Mocked, vi } from 'vitest';

class TestEntity extends BaseEntity {
  name: string;
}

class TestCrudService extends CrudService<TestEntity> {
  resourceName = 'Test Entity';
}

describe('CrudService', () => {
  const repository = {
    save: vi.fn(),
    findOneBy: vi.fn(),
    findAndCount: vi.fn(),
    softDelete: vi.fn(),
    update: vi.fn(),
  };
  const service = new TestCrudService(
    repository as unknown as Mocked<Repository<TestEntity>>,
  );

  it('should create an entity', async () => {
    const input = { name: 'Test' };
    const expectedResult = { id: '1', name: 'Test' } as TestEntity;
    repository.save.mockResolvedValue(expectedResult);

    const result = await service.create(input);
    expect(result).toEqual(expectedResult);
    expect(repository.save).toHaveBeenCalledWith(input);
  });

  it('should update an entity', async () => {
    const updatedBy = randomUUID();
    const input = { id: '1', name: 'Updated Test', updatedBy } as TestEntity;
    const existingEntity = { id: '1', name: 'Test' } as TestEntity;
    repository.findOneBy.mockResolvedValue(existingEntity);
    repository.save.mockResolvedValue(input);

    const result = await service.update(input);
    expect(result.updatedBy).toEqual(updatedBy);
    expect(result.name).toEqual('Updated Test');
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: input.id });
    expect(repository.save).toHaveBeenCalledWith(input);
  });

  it('should throw NotFoundException when updating a non-existing entity', async () => {
    repository.findOneBy.mockResolvedValue(null);
    await expect(() =>
      service.update({ id: '1' } as TestEntity),
    ).rejects.toThrow(NotFoundException);
  });

  it('should find all entities with pagination', async () => {
    const params: FindAllParamsDto<TestEntity> = {
      pageOptions: new PageOptions(),
    };
    const data = [
      { id: '1', name: 'Test' } as TestEntity,
      { id: '2', name: 'Test 2' } as TestEntity,
    ];
    repository.findAndCount.mockResolvedValue([data, 2]);

    const result = await service.findAll(params);
    expect(result).toBeInstanceOf(Page);
    expect(result.lastPage).toBe(1);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPreviousPage).toBe(false);
    expect(result.limit).toBe(10);
    expect(result.page).toBe(1);
    expect(result.pageCount).toBe(1);
    expect(result.total).toBe(2);
    expect(result.data).toEqual(data);
    expect(repository.findAndCount).toHaveBeenCalled();
  });

  it('should find one entity by id', async () => {
    const entity = { id: '1', name: 'Test' } as TestEntity;
    repository.findOneBy.mockResolvedValue(entity);

    const result = await service.findOne('1');
    expect(result).toEqual(entity);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: '1' });
  });

  it('should throw NotFoundException when entity not found by id', async () => {
    repository.findOneBy.mockResolvedValue(null);
    await expect(() => service.findOne('1')).rejects.toThrow(NotFoundException);
  });

  it('should delete an entity', async () => {
    const deletedBy = randomUUID();
    const entity = { id: '1', deletedBy } as TestEntity;
    repository.findOneBy.mockResolvedValue(entity);

    const result = await service.delete(entity);
    expect(result).toEqual({ message: 'Test Entity excluido com sucesso.' });
    expect(repository.softDelete).toHaveBeenCalledWith({ id: '1' });
    expect(repository.update).toHaveBeenCalledWith({ id: '1' }, { deletedBy });
  });

  it('should throw NotFoundException when deleting a non-existing entity', async () => {
    const deletedBy = randomUUID();
    repository.findOneBy.mockResolvedValue(null);
    await expect(() =>
      service.delete({ id: '1', deletedBy } as TestEntity),
    ).rejects.toThrow(NotFoundException);
  });
});
