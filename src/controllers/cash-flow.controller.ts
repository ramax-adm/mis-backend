import { CurrentUser } from '@/core/decorators/current-user.decorator';
import { Roles } from '@/core/decorators/user-roles.decorator';
import { UserRole } from '@/core/enums/user-role.enum';
import { User } from '@/core/user';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import { CashFlowReportService } from '@/modules/cash-flow/cash-flow-report.service';
import { CashFlowSimulationService } from '@/modules/cash-flow/cash-flow-simulation.service';
import { TIPOS_ARREND } from '@/modules/cash-flow/constants/tipo-arrend';
import { CashFlowSimulateResponseDto } from '@/modules/cash-flow/dtos/cash-flow-simulate-response.dto';
import { CommonDto } from '@/modules/cash-flow/dtos/common/common.dto';
import { FindAllSimulationsResponseDto } from '@/modules/cash-flow/dtos/find-all-simulations-response.dto';
import { DateUtils } from '@/modules/utils/services/date.utils';
import { NumberUtils } from '@/modules/utils/services/number.utils';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

@Controller('cash-flow')
export class CashFlowController {
  constructor(
    private readonly cashflowSimulationService: CashFlowSimulationService,
    private readonly cashflowReportService: CashFlowReportService,
  ) {}

  @Roles(...[UserRole.Directory])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('simulate')
  @HttpCode(HttpStatus.OK)
  simulate(@Body() dto: CommonDto) {
    const response = this.cashflowSimulationService.simulate(dto);

    return CashFlowSimulateResponseDto.create(response).toJSON();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('arrend-types')
  @HttpCode(HttpStatus.OK)
  getTipoArrend() {
    return TIPOS_ARREND;
  }

  @Roles(...[UserRole.Directory])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@CurrentUser() user: User, @Query('date') date?: string) {
    const parsedDate = date ? DateUtils.toDate(date) : undefined;
    const result = await this.cashflowSimulationService.findAll(user.id, {
      date: parsedDate,
    });

    const response = result.map((item) =>
      FindAllSimulationsResponseDto.create(item).toJSON(),
    );

    return {
      data: response,
      // TODO: improve this into dto response
      totals: {
        cbsMe: NumberUtils.toLocaleString(
          response.reduce(
            (acc, item) => item.entity.requestDto.matPrima.cbsMe + acc,
            0,
          ),
        ),
        cbsMi: NumberUtils.toLocaleString(
          response.reduce(
            (acc, item) => item.entity.requestDto.matPrima.cbsMi + acc,
            0,
          ),
        ),
        entradas: NumberUtils.toLocaleString(
          response.reduce(
            (acc, item) =>
              item.entity.results.operationClosureProjection.entradas + acc,
            0,
          ),
        ),
        saidas: NumberUtils.toLocaleString(
          response.reduce(
            (acc, item) =>
              item.entity.results.operationClosureProjection.saidas + acc,
            0,
          ),
        ),
        fechamento: NumberUtils.toLocaleString(
          response.reduce(
            (acc, item) =>
              item.entity.results.operationClosureProjection.fechamento + acc,
            0,
          ),
        ),
      },
    };
  }

  @Roles(...[UserRole.Directory])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async save(@Body() dto: CommonDto, @CurrentUser() user: User) {
    return await this.cashflowSimulationService.save(user.id, dto);
  }

  @Roles(...[UserRole.Directory])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('export-xlsx')
  @HttpCode(HttpStatus.OK)
  async exportXLSX(
    @Query('simulation-id') simulationId: string = null,
    @Body() dto: CommonDto,
    @Res() res: Response,
  ) {
    let simulationResults;
    if (simulationId) {
      const storedSimulation =
        await this.cashflowSimulationService.findOne(simulationId);

      dto = storedSimulation.requestDto as CommonDto;
      simulationResults = storedSimulation.results;
    } else {
      simulationResults = this.cashflowSimulationService.simulate(dto);
    }

    const result = await this.cashflowReportService.export({
      request: dto,
      results: simulationResults,
    });

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.header(
      'Content-Disposition',
      `attachment; filename=${formattedDate}-cash-flow.xlsx`,
    );
    res.type(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(result);
  }

  @Roles(...[UserRole.Directory])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.cashflowSimulationService.delete(user.id, id);
  }

  @Roles(...[UserRole.Directory])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMany(@Query('date') date: string, @CurrentUser() user: User) {
    return await this.cashflowSimulationService.deleteMany(
      user.id,
      DateUtils.toDate(date),
    );
  }
}
