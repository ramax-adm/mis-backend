// src/config/env.config.ts
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  validateSync,
  IsBoolean,
  IsEnum,
  IsUrl,
} from 'class-validator';
import { plainToClass, Transform } from 'class-transformer';

export class EnvSchema {
  @IsEnum(['development', 'testing', 'production'])
  @IsNotEmpty()
  BE_ENVIRONMENT: 'development' | 'testing' | 'production';

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  BE_API_TEST_URL: string;

  @IsString()
  @IsNotEmpty()
  BE_SECRET: string;

  @IsNumber()
  @Transform(({ value }) => value || 3000)
  BE_PORT: number;

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  SERVER_API_URL: string;

  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsBoolean()
  @IsNotEmpty()
  DB_SSL: boolean;

  @IsNumber()
  @IsNotEmpty()
  DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;

  @IsBoolean()
  @IsNotEmpty()
  DB_LOGGING: boolean;

  @IsString()
  @IsNotEmpty()
  DB_SCHEMA: string;

  @IsString()
  @IsNotEmpty()
  AWS_REGION: string;

  @IsString()
  @IsNotEmpty()
  AWS_S3_BUCKET: string;

  @IsString()
  @IsNotEmpty()
  AWS_S3_ACCESS_KEY_ID: string;

  @IsString()
  @IsNotEmpty()
  AWS_S3_SECRET_ACCESS_KEY: string;

  @IsString()
  @IsNotEmpty()
  AWS_SES_ACCESS_KEY_ID: string;

  @IsString()
  @IsNotEmpty()
  AWS_SES_SECRET_ACCESS_KEY: string;

  @IsString()
  @IsNotEmpty()
  AWS_SES_EMAIL: string;

  static validate(config: Record<string, any>) {
    const validatedConfig = plainToClass(EnvSchema, config, {
      enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig, {
      skipMissingProperties: false,
    });

    if (errors.length > 0) {
      throw new Error(errors.toString());
    }

    return validatedConfig;
  }
}
