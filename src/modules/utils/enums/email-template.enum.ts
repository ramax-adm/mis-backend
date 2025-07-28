import { PASSWORD_RECOVERY_TEMPLATE } from '../emails/password-recovery.template';

export enum EmailTemplateEnum {
  PASSWORD_RECOVERY = 'password-recovery',
}

export const EMAIL_TEMPLATES = [
  {
    id: 'password-recovery',
    template: PASSWORD_RECOVERY_TEMPLATE,
  },
];
