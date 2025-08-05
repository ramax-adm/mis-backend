import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from './env.schema';

@Injectable()
export class EnvService implements OnModuleInit {
  constructor(private configService: ConfigService<EnvSchema, true>) {}

  onModuleInit() {
    // TODO:
    // const envSchema = EnvSchema.validate(process.env);
    // console.log('Loaded environment variables:');
  }

  get<T extends keyof EnvSchema>(key: T) {
    return this.configService.get(key, { infer: true });
  }
}
