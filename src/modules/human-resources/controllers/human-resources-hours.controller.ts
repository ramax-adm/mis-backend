import { HumanResourcesHoursService } from '@/modules/human-resources/services/human-resources-hours.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import { GetHumanResourcesHoursLastUpdatedAtResponseDto } from '@/modules/human-resources/dtos/get-human-resources-hours-last-updated-at-response.dto';
import { DateUtils } from '@/modules/utils/services/date.utils';
import { ExportHumanResourcesHoursReportDto } from '@/modules/human-resources/dtos/export-human-resources-hours-report.dto';
import { Response } from 'express';
import { HumanResourcesHoursReportService } from '@/modules/human-resources/services/human-resources-hours-report.service';
import {
  GET_HUMAN_RESOURCES_HOURS_DATES_QUERY,
  GET_HUMAN_RESOURCES_DEPARTMENTS_QUERY,
  GET_HUMAN_RESOURCES_EMPLOYEES_QUERY,
} from '../constants/human-resources-hours';

@Controller('human-resources-hours')
export class HumanResourcesHoursController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly humanResourcesHoursService: HumanResourcesHoursService,
    private readonly humanResourcesHoursReportService: HumanResourcesHoursReportService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('last-update')
  @HttpCode(200)
  async getLastUpdatedAt() {
    const response = await this.humanResourcesHoursService.getLastUpdatedAt();

    return GetHumanResourcesHoursLastUpdatedAtResponseDto.create(
      response,
    ).toJSON();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/dates')
  async getDates(@Query('companyCode') companyCode: string) {
    const query = GET_HUMAN_RESOURCES_HOURS_DATES_QUERY;

    return await this.dataSource.query<{ date: Date }[]>(query, [companyCode]);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/departments')
  async getDepartments(@Query('companyCode') companyCode: string) {
    const query = GET_HUMAN_RESOURCES_DEPARTMENTS_QUERY;

    return await this.dataSource.query<{ department: string }[]>(query, [
      companyCode,
    ]);
  }

  @Get('/employees')
  async getEmployees(
    @Query('companyCode') companyCode: string,
    @Query('department') department: string = '',
  ) {
    const query = GET_HUMAN_RESOURCES_EMPLOYEES_QUERY;

    const data = await this.dataSource.query<{ employee_name: string }[]>(
      query,
      [companyCode, department],
    );

    return data.map((item) => ({ employeeName: item.employee_name }));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/analytical')
  async getAnalyticalData(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('companyCode') companyCode: string,
    @Query('employeeName') employeeName: string = '',
    @Query('department') department: string = '',
  ) {
    const response = await this.humanResourcesHoursService.getAnalyticalData({
      startDate,
      endDate,
      companyCode,
      department,
      employeeName,
    });

    const totalNormalHours = response.map((item) => item.normalHours);

    const totalHalfExtraHours = response.map((item) => item.halfExtraHours);
    const totalFullExtraHours = response.map((item) => item.fullExtraHours);
    const totalExtraHours = [...totalHalfExtraHours, ...totalFullExtraHours];

    const totalHoursOff = response.map((item) => item.hoursOff);
    const totalAbsenceHours = response.map((item) => item.absenceHours);

    // totals
    return {
      originalData: response.map((item) => item),
      parsedData: response.map((item) => item.toJSON()),
      totals: {
        normalHours: DateUtils.reduceAbsoluteTime(totalNormalHours),
        extraHours: DateUtils.reduceAbsoluteTime(totalExtraHours),
        halfExtraHours: DateUtils.reduceAbsoluteTime(totalHalfExtraHours),
        fullExtraHours: DateUtils.reduceAbsoluteTime(totalFullExtraHours),
        hoursOff: DateUtils.reduceAbsoluteTime(totalHoursOff),
        absenceHours: DateUtils.reduceAbsoluteTime(totalAbsenceHours),
      },
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/resume')
  async getResumeData(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('companyCode') companyCode: string,
    @Query('employeeName') employeeName: string = '',
    @Query('department') department: string = '',
  ) {
    const response = await this.humanResourcesHoursService.getResumeData({
      startDate,
      endDate,
      companyCode,
      department,
      employeeName,
    });

    return response;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/analyses')
  async getAnalysesData(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('companyCode') companyCode: string,
    @Query('employeeName') employeeName: string = '',
    @Query('department') department: string = '',
  ) {
    const response = await this.humanResourcesHoursService.getAnalysesData({
      companyCode,
      department,
      employeeName,
      startDate,
      endDate,
    });

    return response;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/export-xlsx')
  @HttpCode(HttpStatus.OK)
  async exportXLSX(
    @Body() dto: ExportHumanResourcesHoursReportDto,
    @Res() res: Response,
  ) {
    const result =
      await this.humanResourcesHoursReportService.exportAnalytical(dto);

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.header(
      'Content-Disposition',
      `attachment; filename=${formattedDate}-extra-hours.xlsx`,
    );
    res.type(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(result);
  }
}
