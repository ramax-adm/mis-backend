import { PASSWORD_RECOVERY_TEMPLATE } from '../emails/password-recovery.template';
import { WELCOME_USER_TEMPLATE } from '../emails/welcome-user.template';

export enum EmailTemplateEnum {
  WELCOME_USER = 'welcome-user',
  PASSWORD_RECOVERY = 'password-recovery',
}

export const EMAIL_TEMPLATES = [
  {
    id: EmailTemplateEnum.WELCOME_USER,
    template: WELCOME_USER_TEMPLATE,
  },
  {
    id: EmailTemplateEnum.PASSWORD_RECOVERY,
    template: PASSWORD_RECOVERY_TEMPLATE,
  },
];
