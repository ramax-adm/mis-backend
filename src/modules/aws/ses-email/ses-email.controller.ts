import { Body, Controller, Inject, Post } from '@nestjs/common';
import { IEmailService } from './common';
@Controller('aws/ses')
export class SESEmailController {
  constructor(
    @Inject('EMAIL_SERVICE')
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
