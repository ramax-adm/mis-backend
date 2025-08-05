import { Body, Controller, Inject, Post } from '@nestjs/common';
import { EMAIL_SERVICE_PROVIDER, IEmailService } from './common';
@Controller('aws/ses')
export class SESEmailController {
  constructor(
    @Inject(EMAIL_SERVICE_PROVIDER)
    private readonly sesEmailService: IEmailService,
  ) {}

  @Post()
  async sendEmail(
    @Body() sendEmailDto: { email: string; message: string; subject: string },
  ) {
    await this.sesEmailService.sendEmail({
      ccAddresses: [],
      htmlBody: sendEmailDto.message,
      subject: sendEmailDto.subject,
      toAddresses: [sendEmailDto.email],
    });
  }
}
