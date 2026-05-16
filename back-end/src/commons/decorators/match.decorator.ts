import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'match' })
export class MatchConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    const relatedProperty = args.constraints[0] as string;
    const relatedValue = (args.object as Record<string, unknown>)[
      relatedProperty
    ];
    return value === relatedValue;
  }

  defaultMessage() {
    return 'As senhas não conferem';
  }
}

export function Match(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: MatchConstraint,
    });
  };
}
