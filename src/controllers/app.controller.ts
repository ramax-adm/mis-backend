import { Controller, Get, HttpCode } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Holiday } from '@/services/utils/entities/holiday.entity';
import { NumberUtils } from '@/services/utils/number.utils';
import { EnvService } from '@/config/env/env.service';
import { DateUtils } from '@/services/utils/date.utils';

@Controller()
export class AppController {
  constructor(
    // services
    private readonly envService: EnvService,
    private readonly httpService: HttpService,

    // repositories
    @InjectRepository(Holiday)
    private readonly holidayRepository: Repository<Holiday>,
  ) {}

  // TODO: docs

  @Get('health')
  @HttpCode(200)
  async health() {
    // Environment
    const environment = this.envService.get('BE_ENVIRONMENT');

    // Http testing
    const httpUrlCall = this.envService.get('BE_API_TEST_URL');
    const httpTest = await this.httpService.axiosRef.get(httpUrlCall);
    const httpResponse = httpTest.data.slice(0, 1);

    // Db testing
    const dbCount = await this.holidayRepository.count();

    // On-premise server testing
    // const serverUrlCall = this.envService
    //   .get('SERVER_API_URL')
    //   .concat('/health');
    // const serverResponse = await this.httpService.axiosRef.get(serverUrlCall);
    // const isServerOk = serverResponse.status === 200;

    // Process testing
    const uptimeInSeconds = NumberUtils.nb2(process.uptime());
    const now = new Date();

    return {
      message: 'RAMAX API - Health verification',
      moment: now,
      uptime: `${DateUtils.secondsToHours(uptimeInSeconds)}`,
      environment,
      dbCheck: !!dbCount,
      dbCount,
      httpCheck: !!httpResponse,
      httpUrlCall,
      httpTestResponse: httpResponse,
      // serverCheck: isServerOk,
      // serverUrlCall,
      // serverResponse: serverResponse.data,
    };
  }
}
