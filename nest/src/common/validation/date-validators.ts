import { buildMessage, ValidateBy, ValidationOptions } from 'class-validator';
import { diffDays, ISO_DATE_PATTERN, isValidIsoDate } from '../date/iso-date';

/** Rejects dates that do not exist, like 2026-02-30. Format is checked by @Matches. */
export function IsCalendarDate(options?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isCalendarDate',
      validator: {
        validate: (value: unknown) =>
          typeof value !== 'string' ||
          !ISO_DATE_PATTERN.test(value) ||
          isValidIsoDate(value),
        defaultMessage: buildMessage(
          (eachPrefix) => `${eachPrefix}$property must be a real calendar date`,
          options,
        ),
      },
    },
    options,
  );
}

/** The date must be on or after the date in another field. */
export function IsOnOrAfter(property: string, options?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isOnOrAfter',
      constraints: [property],
      validator: {
        validate: (value: unknown, args) => {
          const other = (args?.object as Record<string, unknown>)[property];
          if (!isValidIsoDate(value) || !isValidIsoDate(other)) return true;
          return value >= other;
        },
        defaultMessage: buildMessage(
          (eachPrefix) =>
            `${eachPrefix}$property must be on or after $constraint1`,
          options,
        ),
      },
    },
    options,
  );
}

/** Limits how many days a date range can cover. */
export function IsWithinDaysOf(
  property: string,
  maxDays: number,
  options?: ValidationOptions,
) {
  return ValidateBy(
    {
      name: 'isWithinDaysOf',
      constraints: [property, maxDays],
      validator: {
        validate: (value: unknown, args) => {
          const other = (args?.object as Record<string, unknown>)[property];
          if (!isValidIsoDate(value) || !isValidIsoDate(other)) return true;
          return diffDays(value, other) < maxDays;
        },
        defaultMessage: buildMessage(
          (eachPrefix) =>
            `${eachPrefix}range from $constraint1 to $property must not exceed $constraint2 days`,
          options,
        ),
      },
    },
    options,
  );
}
