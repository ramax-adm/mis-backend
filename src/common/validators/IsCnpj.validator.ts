import { registerDecorator, ValidationOptions } from 'class-validator';

import { cnpj } from 'cpf-cnpj-validator';

export function IsCNPJ(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsCNPJ',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property || 'IsCNPJ'],
      options: {
        ...validationOptions,
        message: 'Invalid CNPJ',
      },
      validator: {
        validate(value: any) {
          return cnpj.isValid(value);
        },
      },
    });
  };
}
