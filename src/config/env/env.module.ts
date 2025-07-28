import { Module } from '@nestjs/common';
import { EnvService } from './env.service';
import { ConfigModule } from '@nestjs/config';
import { EnvSchema } from './env.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: EnvSchema.validate }),
  ],
  controllers: [],
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}
