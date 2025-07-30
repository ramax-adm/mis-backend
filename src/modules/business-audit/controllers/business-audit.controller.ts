import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BusinessAuditService } from '../services/business-audit.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';

@Controller('business-audit')
export class BusinessAuditController {
  constructor(private readonly businessAuditService: BusinessAuditService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('resumed')
  @HttpCode(HttpStatus.OK)
  async getData(
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return await this.businessAuditService.getData({
      startDate,
      endDate,
    });
  }
}
