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

@ApiTags('Auditoria: Visão geral')
@ApiBearerAuth(SWAGGER_API_SECURITY.BEARER_AUTH)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('business-audit/overview')
export class BusinessAuditOverviewController {
  constructor(
    private readonly businessAuditOverviewService: BusinessAuditOverviewService,
  ) {}

  // @Get()
  // @HttpCode(HttpStatus.OK)
  // async getOverviewData(
  //   @Query('startDate') startDate?: Date,
  //   @Query('endDate') endDate?: Date,
  // ) {
  //   return await this.businessAuditOverviewService.getOverviewData({
  //     startDate,
  //     endDate,
  //   });
  // }

  @ApiControllerDoc({
    summary: '',
    successStatus: HttpStatus.OK,
    successDescription: '',
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async getOverviewData() {
    const data = this.businessAuditOverviewService.getData();

    return data;
  }
}
