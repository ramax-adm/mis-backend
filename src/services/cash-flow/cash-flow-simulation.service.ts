import { Injectable, NotFoundException } from '@nestjs/common';
import { CommonDto } from './dtos/common/common.dto';
import { CashFlowService } from './cash-flow.service';
import { InjectRepository } from '@nestjs/typeorm';
import { CashFlowSimulation } from './entities/cash-flow-simulation.entity';
import { Between, FindOptionsWhere, IsNull, Repository } from 'typeorm';
import * as dateFns from 'date-fns';

@Injectable()
export class CashFlowSimulationService {
  constructor(
    private readonly cashFlowService: CashFlowService,

    @InjectRepository(CashFlowSimulation)
    private readonly cashFlowSimulationRepository: Repository<CashFlowSimulation>,
  ) {}

  simulate(dto: CommonDto) {
    const productionValues = this.cashFlowService.getProductionValues(dto);
    const productionProjection = this.cashFlowService.projectProduction(dto);
    const entriesProjection = this.cashFlowService.projectEntries(dto);
    const outingsProjection = this.cashFlowService.projectOutings(dto);
    const operationClosureProjection =
      this.cashFlowService.projectOperationClosure(dto);
    const costsByKgProjection = this.cashFlowService.projectCostByKg(dto);
    const dailyFlowProjection = this.cashFlowService.projectDailyFlow(dto);

    return {
      productionValues,
      productionProjection,
      entriesProjection,
      outingsProjection,
      operationClosureProjection,
      costsByKgProjection,
      dailyFlowProjection,
    };
  }

  // find
  async findOne(id: string) {
    const simulation = await this.cashFlowSimulationRepository.findOne({
      where: {
        id,
      },
    });

    if (!simulation) {
      throw new NotFoundException('A simulação nao pode ser encontrada.');
    }

    return simulation;
  }

  async findAll(userId: string, query: { date?: Date }) {
    const { date } = query;

    const where: FindOptionsWhere<CashFlowSimulation> = {
      createdById: userId,
      deletedAt: IsNull(),
    };

    if (date) {
      const startOfDay = dateFns.startOfDay(query?.date);
      const endOfDay = dateFns.endOfDay(query?.date);

      Object.assign(where, { createdAt: Between(startOfDay, endOfDay) });
    }

    return await this.cashFlowSimulationRepository.find({
      where,
      relations: { createdBy: true },
    });
  }

  // save
  async save(userId: string, dto: CommonDto) {
    const simulationResults = this.simulate(dto);

    await this.cashFlowSimulationRepository.save({
      requestDto: dto,
      results: simulationResults,
      createdById: userId,
    });
  }

  // delete
  async delete(userId: string, id: string) {
    await this.cashFlowSimulationRepository.update(
      { id },
      {
        deletedById: userId,
        deletedAt: new Date(),
      },
    );
  }

  // delete many
  async deleteMany(userId: string, date: Date) {
    const startOfDay = dateFns.startOfDay(date);
    const endOfDay = dateFns.endOfDay(date);
    await this.cashFlowSimulationRepository.update(
      { createdById: userId, createdAt: Between(startOfDay, endOfDay) },
      {
        deletedById: userId,
        deletedAt: new Date(),
      },
    );
  }
}
