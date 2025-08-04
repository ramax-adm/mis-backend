import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Between, DataSource, FindOptionsWhere } from 'typeorm';
import { UtilsStorageSyncedFile } from './entities/storage-synced-file.entity';
import { EnvService } from '@/config/env/env.service';
import { S3StorageService, STORAGE_SERVICE_PROVIDER } from '../aws';
import * as dateFns from 'date-fns';
import { GetSyncedDataResponseDto } from './dtos/get-synced-data-response.dto';

@Injectable()
export class UtilsService {
  constructor(
    @Inject(STORAGE_SERVICE_PROVIDER)
    private readonly storageService: S3StorageService,
    private readonly envService: EnvService,
    private readonly datasource: DataSource,
  ) {}

  async getSyncedFiles({ date, entity }: { date?: Date; entity?: string }) {
    const bucket = this.envService.get('AWS_S3_BUCKET');
    const where: FindOptionsWhere<UtilsStorageSyncedFile> = {};

    if (date) {
      const startOfDate = dateFns.startOfDay(date);
      const endOfDate = dateFns.endOfDay(date);
      where.createdAt = Between(startOfDate, endOfDate);
    }

    if (entity) {
      where.entity = entity;
    }

    const data = await this.datasource.manager.find<UtilsStorageSyncedFile>(
      UtilsStorageSyncedFile,
      {
        where,
        order: {
          createdAt: 'DESC',
        },
      },
    );

    return data.map((i) =>
      GetSyncedDataResponseDto.create({
        ...i,
        bucket,
      }),
    );
  }

  async getSyncedFileSignedUrl({ id }: { id: string }) {
    const file = await this.datasource.manager.findOne<UtilsStorageSyncedFile>(
      UtilsStorageSyncedFile,
      {
        where: { id },
      },
    );

    if (!file) {
      throw new NotFoundException(`O Recurso com o ${id} nao existe`);
    }

    const tenMinutesInSeconds = 60 * 10;
    const signedUrl = await this.storageService.getSignedUrl(
      {
        Bucket: this.envService.get('AWS_S3_BUCKET'),
        Key: file.fileUrl,
      },
      tenMinutesInSeconds,
    );
    return { signedUrl };
  }
}
