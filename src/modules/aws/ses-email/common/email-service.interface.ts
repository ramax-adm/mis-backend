import { SendEmailRequest } from './send-email.interface';

export interface IEmailService {
  sendEmail(data: SendEmailRequest): Promise<string>;
}
