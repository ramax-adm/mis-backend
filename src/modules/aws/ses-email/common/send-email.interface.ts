export interface SendEmailRequest {
  toAddresses: Array<string>;
  ccAddresses: Array<string>;
  htmlBody: string;
  subject: string;
}
