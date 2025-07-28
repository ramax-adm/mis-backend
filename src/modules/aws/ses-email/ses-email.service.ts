import {
  SESClient,
  SESClientConfig,
  SendEmailCommand,
} from '@aws-sdk/client-ses';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { SendEmailRequest } from './common/send-email.interface';
import { IEmailService } from './common/email-service.interface';
import { EnvService } from '@/config/env/env.service';

@Injectable()
export class SESEmailService implements IEmailService {
  private readonly sesClient: SESClient;

  constructor(
    @Inject('AWS_CONFIG_CONNECTION_OPTIONS')
    private readonly sesConfig: SESClientConfig,
    private readonly envService: EnvService,
  ) {
    Logger.log('Initializing Aws Module', 'AWS SES SERVICE');
    this.sesClient = new SESClient(sesConfig);
  }

  async sendEmail(email: SendEmailRequest) {
    const fromEmailAddress = this.envService.get('AWS_SES_EMAIL');
    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: email.toAddresses,
        CcAddresses: email.ccAddresses,
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: email.htmlBody,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: email.subject,
        },
      },
      Source: fromEmailAddress,
    });
    const emailResponse = await this.sesClient.send(command);
    return emailResponse.MessageId as string;
  }
}
