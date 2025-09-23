import { Module, Provider } from '@nestjs/common';
import { SharedSensattaController } from './sensatta/shared-sensatta.controller';
import { SharedFiscalController } from './fiscal/shared-fiscal.controller';
import { DatabaseModule } from '@/config/database/database.module';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { ApiKeyGuard } from '@/modules/auth/guards/api-key-guard';
import { EnvModule } from '@/config/env/env.module';

const ApiKeyGuardProvider: Provider = {
  provide: APP_GUARD,
  useClass: ApiKeyGuard,
};

@Module({
  imports: [DatabaseModule, EnvModule],
  controllers: [SharedSensattaController, SharedFiscalController],
  // providers: [ApiKeyGuardProvider],
})
export class SharedModule {}
