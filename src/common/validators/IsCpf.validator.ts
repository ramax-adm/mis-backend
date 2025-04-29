import { registerDecorator, ValidationOptions } from 'class-validator';

import { cpf } from 'cpf-cnpj-validator';

export function IsCPF(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsCPF',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property || 'IsCPF'],
      options: {
        ...validationOptions,
        message: 'Invalid CPF',
      },
      validator: {
        validate(value: any) {
          return cpf.isValid(value);
        },
      },
    });
  };
}
