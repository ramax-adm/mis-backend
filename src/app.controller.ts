import { Controller, Get, HttpCode } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { Holiday } from '@/modules/utils/entities/holiday.entity';
import { NumberUtils } from '@/modules/utils/services/number.utils';
import { EnvService } from '@/config/env/env.service';
import { DateUtils } from '@/modules/utils/services/date.utils';
import {
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';

class GetHealthResponseDto {
  @ApiProperty()
  message: string;
  @ApiProperty()
  moment: Date;
  @ApiProperty()
  uptime: string;
  @ApiProperty()
  environment: string;
  @ApiProperty()
  dbCheck: boolean;
  @ApiProperty()
  dbCount: number;
}

@ApiTags('App')
@Controller()
export class AppController {
  constructor(
    // services
    private readonly envService: EnvService,
    private readonly httpService: HttpService,
    private readonly datasource: DataSource,
  ) {}

  // TODO: docs
  @ApiOkResponse({
    description: 'Retorna uma resposta com indicadores de status da aplicação.',
    type: GetHealthResponseDto,
  })
  @Get('health')
  @HttpCode(200)
  async health() {
    // Environment
    const environment = this.envService.get('BE_ENVIRONMENT');

    // Http testing
    // const httpUrlCall = this.envService.get('BE_API_TEST_URL');
    // const httpTest = await this.httpService.axiosRef.get(httpUrlCall);
    // const httpResponse = httpTest.data.slice(0, 1);

    // Db testing
    const qb = this.datasource.createQueryBuilder();

    const dbCount = await qb
      .select('COUNT(*)', 'count')
      .from(Holiday, 'holiday')
      .getRawOne()
      .then((result) => Number(result.count));

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
      // httpCheck: !!httpResponse,
      // httpUrlCall,
      // httpTestResponse: httpResponse,
      // serverCheck: isServerOk,
      // serverUrlCall,
      // serverResponse: serverResponse.data,
    };
  }
}
