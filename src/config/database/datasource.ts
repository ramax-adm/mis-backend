import { join } from 'path';

import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  schema: process.env.DB_SCHEMA,
  logging: process.env.DB_LOGGING == 'true',
  synchronize: false,
  name: 'default',
  ssl: process.env.DB_SSL == 'true' ? { rejectUnauthorized: false } : false,
  entities: [join(__dirname, '..', '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, '..', 'database/migrations/**/*.{ts,js}')],
  subscribers: [],
  poolSize: 10,
  connectTimeoutMS: 30000,
  maxQueryExecutionTime: 10000,
  extra: {
    connectionLimit: 10,
    max: 10,
  },
};

console.log({ dataSourceOptions });

const dataSource = new DataSource(dataSourceOptions);
dataSource.initialize();
export { dataSource };
