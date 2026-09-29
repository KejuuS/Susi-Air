import { Matches } from 'class-validator';
import { ISO_DATE_PATTERN } from '../../common/date/iso-date';
import {
  IsCalendarDate,
  IsOnOrAfter,
  IsWithinDaysOf,
} from '../../common/validation/date-validators';

export const MAX_RANGE_DAYS = 366;

const DATE_FORMAT_MESSAGE = '$property must use the YYYY-MM-DD format';

export class FlightHoursQueryDto {
  @Matches(ISO_DATE_PATTERN, { message: DATE_FORMAT_MESSAGE })
  @IsCalendarDate()
  from!: string;

  @Matches(ISO_DATE_PATTERN, { message: DATE_FORMAT_MESSAGE })
  @IsCalendarDate()
  @IsOnOrAfter('from')
  @IsWithinDaysOf('from', MAX_RANGE_DAYS)
  to!: string;
}
