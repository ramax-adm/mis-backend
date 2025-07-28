import { EnvModule } from '@/config/env/env.module';
import { Module } from '@nestjs/common';
import { SESEmailServiceProvider } from './common/email-service.provider';
import { SESEmailController } from './ses-email.controller';

@Module({
  imports: [EnvModule],
  providers: [SESEmailServiceProvider],
  controllers: [SESEmailController],
  exports: [SESEmailServiceProvider],
})
export class SESEmailModule {}
