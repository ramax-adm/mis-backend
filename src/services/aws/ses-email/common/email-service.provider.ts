import { Provider } from '@nestjs/common';
import { SESEmailService } from '../ses-email.service';
import { EnvService } from '@/config/env/env.service';

export const SESEmailServiceProvider: Provider = {
  provide: 'EMAIL_SERVICE',
  inject: [EnvService],
  useFactory: (envService: EnvService) => {
    const sesConfig = {
      region: envService.get('AWS_SES_REGION'),
      credentials: {
        accessKeyId: envService.get('AWS_SES_ACCESS_KEY_ID') ?? '',
        secretAccessKey: envService.get('AWS_SES_SECRET_ACCESS_KEY') ?? '',
      },
    };

    return new SESEmailService(sesConfig, envService);
  },
};
