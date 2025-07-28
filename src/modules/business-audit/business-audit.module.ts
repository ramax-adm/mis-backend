import { Module } from '@nestjs/common';
import { BusinessAuditController } from './controllers/business-audit.controller';
import { BusinessAuditService } from './services/business-audit.service';

@Module({
  providers: [BusinessAuditService],
  controllers: [BusinessAuditController],
})
export class BusinessAuditModule {}
