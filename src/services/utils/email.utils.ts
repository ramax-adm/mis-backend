import {
  EMAIL_TEMPLATES,
  EmailTemplateEnum,
} from './enums/email-template.enum';
import Handlebars from 'handlebars';

export class EmailUtils {
  static createFromTemplate<T>(payload: T, template: EmailTemplateEnum) {
    const desiredTemplate = this.getTemplate(template);

    const compiled = Handlebars.compile(desiredTemplate);
    return compiled(payload);
  }

  static getTemplate(template: EmailTemplateEnum) {
    return EMAIL_TEMPLATES.find((item) => item.id === template)?.template;
  }
}
