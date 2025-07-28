import { EmailUtils } from './email.utils';
import {
  IPASSWORD_RECOVERY_TEMPLATE,
  PASSWORD_RECOVERY_TEMPLATE,
} from '../emails/password-recovery.template';
import { EmailTemplateEnum } from '../enums/email-template.enum';
import { it, describe, expect } from 'vitest';

describe('EmailUtils', () => {
  describe('Create From Template', () => {
    it('should be able to create a handlebars template', () => {
      const createEmailPayload = {
        username: 'lucas.santana',
        token: 'aaaa',
      };
      const sut = EmailUtils.createFromTemplate<IPASSWORD_RECOVERY_TEMPLATE>(
        createEmailPayload,
        EmailTemplateEnum.PASSWORD_RECOVERY,
      );

      expect(sut).toBeDefined();
    });
  });

  describe('Get Template', () => {
    it('should be able to get a email template', () => {
      const sut1 = EmailUtils.getTemplate(EmailTemplateEnum.PASSWORD_RECOVERY);
      expect(sut1).toBe(PASSWORD_RECOVERY_TEMPLATE);
    });
  });
});
