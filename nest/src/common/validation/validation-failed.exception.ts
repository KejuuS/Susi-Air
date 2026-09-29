import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export interface ValidationErrorDetail {
  field: string;
  messages: string[];
}

/** A validation error that also lists which fields failed. */
export class ValidationFailedException extends BadRequestException {
  constructor(readonly details: ValidationErrorDetail[]) {
    super('Validation failed');
  }
}

export function validationExceptionFactory(
  errors: ValidationError[],
): ValidationFailedException {
  return new ValidationFailedException(flattenErrors(errors));
}

function flattenErrors(
  errors: ValidationError[],
  parentPath = '',
): ValidationErrorDetail[] {
  return errors.flatMap((error) => {
    const field = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    const own: ValidationErrorDetail[] = error.constraints
      ? [{ field, messages: Object.values(error.constraints) }]
      : [];
    return [...own, ...flattenErrors(error.children ?? [], field)];
  });
}
