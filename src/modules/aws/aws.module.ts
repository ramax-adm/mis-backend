import { EnvModule } from '@/config/env/env.module';
import { Module } from '@nestjs/common';
import { SESEmailServiceProvider } from './ses-email/common';
import { SESEmailController } from './ses-email/ses-email.controller';
import { S3StorageController } from './s3-storage/s3-storage.controller';
import { StorageServiceProvider } from './s3-storage/common';

@Module({
  imports: [EnvModule],
  providers: [SESEmailServiceProvider, StorageServiceProvider],
  controllers: [SESEmailController, S3StorageController],
  exports: [SESEmailServiceProvider, StorageServiceProvider],
})
export class AwsModule {}
