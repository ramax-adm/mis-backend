import { Provider } from '@nestjs/common';
import { S3StorageService } from '../s3-storage.service';
import { EnvService } from '@/config/env/env.service';

export const StorageServiceProvider: Provider = {
  provide: 'STORAGE_SERVICE',
  inject: [EnvService],
  useFactory: (envService: EnvService) => {
    return new S3StorageService(
      {
        region: envService.get('AWS_REGION') ?? '',
        credentials: {
          accessKeyId: envService.get('AWS_S3_ACCESS_KEY_ID') ?? '',
          secretAccessKey: envService.get('AWS_S3_SECRET_ACCESS_KEY') ?? '',
        },
      },
      envService,
    );
  },
};
