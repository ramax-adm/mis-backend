import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import { CattlePurchaseFreightService } from '@/modules/freights/services/cattle-purchase-freights.service';
import { CattlePurchaseFreightsStatusEnum } from '@/modules/freights/enums/cattle-purchase-freights-status.enum';
import { GetCattlePurchaseFreightLastUpdatedAtResponseDto } from '@/modules/freights/dtos/get-cattle-purchase-freight-last-updated-at-response.dto';
import { NumberUtils } from '@/modules/utils/services/number.utils';
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
import { CATTLE_PURCHASE_FREIGHTS_STATUS } from '@/modules/freights/constants/cattle-purchase-freights-status.enum';
import { ExportCattlePurchaseFreightsReportDto } from '@/modules/freights/dtos/export-cattle-purchase-freights-report.dto';
import { Response } from 'express';
import { CattlePurchaseFreightsReportService } from '@/modules/freights/services/cattle-purchase-freights-report.service';

@Controller('freights')
export class FreightsController {
  constructor(
    private cattlePurchaseFreightsService: CattlePurchaseFreightService,
    private cattlePurchaseFreightsReportService: CattlePurchaseFreightsReportService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('last-update')
  @HttpCode(200)
  async getCattlePurchaseFreightLastUpdatedAt() {
    const response =
      await this.cattlePurchaseFreightsService.getCattlePurchaseFreightLastUpdatedAt();

    return GetCattlePurchaseFreightLastUpdatedAtResponseDto.create(
      response,
    ).toJSON();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('cattle-purchase-freights/statuses')
  @HttpCode(200)
  async getCattlePurchaseFreightsStatuses() {
    return CATTLE_PURCHASE_FREIGHTS_STATUS;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('cattle-purchase-freights/resume')
  @HttpCode(200)
  async getResumeCattlePurchaseFreights(
    @Query('companyCode') companyCode: string = '',
    @Query('startDate') startDate: Date = new Date('2025-01-01'),
    @Query('endDate') endDate: Date = new Date('2025-01-01'),
  ) {
    const data = await this.cattlePurchaseFreightsService.getResumeFreightData({
      companyCode,
      endDate,
      startDate,
    });
    return data;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('cattle-purchase-freights/analytical')
  @HttpCode(200)
  async getAnalyticalCattlePurchaseFreights(
    @Query('startDate') startDate: Date = new Date('2025-01-01'),
    @Query('endDate') endDate: Date = new Date('2025-01-01'),
    @Query('companyCode') companyCode: string = '',
    @Query('status') status: string = '',
    @Query('freightCompany') freightCompany: string = '',
  ) {
    const response =
      await this.cattlePurchaseFreightsService.getAnalyticalFreightData({
        companyCode,
        endDate,
        startDate,
        status,
        freightCompany,
      });

    const noFreights = response.filter(
      (item) => item.status === CattlePurchaseFreightsStatusEnum.NO_FREIGHT,
    );
    const closedFreights = response.filter(
      (item) => item.status === CattlePurchaseFreightsStatusEnum.CLOSED,
    );
    const openFreights = response.filter(
      (item) => item.status === CattlePurchaseFreightsStatusEnum.OPEN,
    );

    const dataResponse = {
      parsedData: response.map((item) => item.toJSON()),
      originalData: response.map((item) => item),
      totals: {
        noFreights: {
          amount: NumberUtils.toLocaleString(noFreights.length),
          cattleQuantity: NumberUtils.toLocaleString(
            noFreights.reduce((acc, item) => acc + item.cattleQuantity, 0),
          ),
        },
        openFreights: {
          amount: NumberUtils.toLocaleString(openFreights.length),
          cattleQuantity: NumberUtils.toLocaleString(
            openFreights.reduce((acc, item) => acc + item.cattleQuantity, 0),
          ),
          openDays: NumberUtils.toLocaleString(
            openFreights.reduce((acc, item) => acc + item.openDays, 0) /
              openFreights.filter((i) => i.openDays > 0).length || 0,
          ),
        },
        closedFreights: {
          amount: NumberUtils.toLocaleString(closedFreights.length),
          cattleQuantity: NumberUtils.toLocaleString(
            closedFreights.reduce((acc, item) => acc + item.cattleQuantity, 0),
          ),
          price: NumberUtils.toLocaleString(
            closedFreights.reduce((acc, item) => acc + item.basePrice, 0),
          ),
          otherPrices: NumberUtils.toLocaleString(
            closedFreights.reduce(
              (acc, item) =>
                acc +
                item.additionalPrice +
                item.tollPrice +
                item.discountPrice,
              0,
            ),
            0,
          ),
          tablePrice: NumberUtils.toLocaleString(
            closedFreights.reduce(
              (acc, item) => acc + item.referenceFreightTablePrice,
              0,
            ),
            0,
          ),
          totalPrice: NumberUtils.toLocaleString(
            closedFreights.reduce(
              (acc, item) => acc + item.negotiatedFreightPrice,
              0,
            ),
            0,
          ),
          headPrice: NumberUtils.toLocaleString(
            closedFreights.reduce(
              (acc, item) => acc + item.negotiatedFreightPrice,
              0,
            ) /
              closedFreights.reduce(
                (acc, item) => acc + item.cattleQuantity,
                0,
              ) || 1,
            2,
          ),
          difPrice: NumberUtils.toLocaleString(
            closedFreights.reduce((acc, item) => acc + item.difPrice, 0),
            0,
          ),
        },
        quantity: response.length,
        cattleQuantity: NumberUtils.nb0(
          response.reduce((acc, item) => acc + item.cattleQuantity, 0),
        ),
      },
    };

    return dataResponse;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('cattle-purchase-freights/export-xlsx')
  @HttpCode(HttpStatus.OK)
  async exportXLSX(
    @Body() dto: ExportCattlePurchaseFreightsReportDto,
    @Res() res: Response,
  ) {
    const result =
      await this.cattlePurchaseFreightsReportService.exportAnalytical(dto);

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.header(
      'Content-Disposition',
      `attachment; filename=${formattedDate}-cattle-freights.xlsx`,
    );
    res.type(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(result);
  }
}
