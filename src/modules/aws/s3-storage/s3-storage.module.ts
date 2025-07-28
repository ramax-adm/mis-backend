import { Module } from '@nestjs/common';
import { StorageServiceProvider } from './common';
import { S3StorageController } from './s3-storage.controller';
import { EnvModule } from '@/config/env/env.module';

@Module({
  imports: [EnvModule],
  controllers: [S3StorageController],
  providers: [StorageServiceProvider],
  exports: [StorageServiceProvider],
})
export class S3StorageModule {}
