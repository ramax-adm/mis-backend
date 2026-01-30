import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { BusinessAuditOverviewService } from '../services/business-audit-overview-new.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import { DataSource } from 'typeorm';
import { SWAGGER_API_SECURITY } from '@/core/constants/swagger-security';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApiControllerDoc } from '@/core/decorators/api-doc.decorator';
import { BusinessAuditOverviewService as BusinessAuditOverviewNewService } from '../services/business-audit-overview-new.service';
import { BusinessAuditInvoiceTraceabilityService } from '../services/business-audit-invoice-traceability.service';

@ApiTags('Auditoria: Refaturamentos')
@ApiBearerAuth(SWAGGER_API_SECURITY.BEARER_AUTH)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('business-audit/invoice-traceability')
export class BusinessAuditInvoiceTraceabilityController {
  constructor(
    private readonly businessAuditInvoiceTraceabilityService: BusinessAuditInvoiceTraceabilityService,
  ) {}

  @ApiControllerDoc({
    summary: '',
    successStatus: HttpStatus.OK,
    successDescription: '',
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async getInvoiceTraceabilityData(
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('companyCodes') companyCodes?: string,
    @Query('clientCodes') clientCodes?: string,
    @Query('salesRepresentativeCodes') salesRepresentativeCodes?: string,
  ) {
    const data = this.businessAuditInvoiceTraceabilityService.getData({
      startDate,
      endDate,
      companyCodes: companyCodes?.split(','),
      clientCodes: clientCodes?.split(','),
      salesRepresentativeCodes: salesRepresentativeCodes?.split(','),
    });

    return data;
  }
}
