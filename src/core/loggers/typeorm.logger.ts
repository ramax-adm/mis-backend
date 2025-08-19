import { Logger, QueryRunner } from 'typeorm';

export class TypeormLogger implements Logger {
  constructor(private baseLogger: Logger) {}

  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    const start = Date.now();

    // executa a query real
    this.baseLogger.logQuery(query, parameters, queryRunner);

    // quando terminar, mede o tempo
    const duration = Date.now() - start;
    this.baseLogger.log('info', `QUERY Execution Time: ${duration} ms`);
  }

  // delega o resto direto pro baseLogger
  logQueryError(
    error: string | Error,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) {
    this.baseLogger.logQueryError?.(error, query, parameters, queryRunner);
  }
  logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) {
    this.baseLogger.logQuerySlow?.(time, query, parameters, queryRunner);
  }
  logSchemaBuild(message: string, queryRunner?: QueryRunner) {
    this.baseLogger.logSchemaBuild?.(message, queryRunner);
  }
  logMigration(message: string, queryRunner?: QueryRunner) {
    this.baseLogger.logMigration?.(message, queryRunner);
  }
  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner) {
    this.baseLogger.log?.(level, message, queryRunner);
  }
}
