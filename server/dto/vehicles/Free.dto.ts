import { Type } from 'class-transformer';
import {
  IsDate,
  IsString,
  IsNumber,
  IsPositive,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

const PeriodExtendsLessThanRange = (
  startDateField: string,
  endDateField: string,
  validationOptions?: ValidationOptions,
) => {
  return (obj, propertyName: string) => {
    registerDecorator({
      name: 'periodExtendsLessThanRange',
      target: obj.constructor,
      propertyName: propertyName,
      constraints: [startDateField, endDateField],
      options: validationOptions,
      validator: {
        validate(value, validationArguments?) {
          const [startDateField, endDateField] =
            validationArguments.constraints;
          const startDate = validationArguments.object[startDateField];
          const endDate = validationArguments.object[endDateField];
          return value <= (endDate.getTime() - startDate.getTime()) / 1000;
        },
      },
    });
  };
};

const IsBefore = (property: string, validationOptions?: ValidationOptions) => {
  return (obj, propertyName: string) => {
    registerDecorator({
      name: 'isBefore',
      target: obj.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value, validationArguments?) {
          const [relatedPropertyName] = validationArguments.constraints;
          const relatedValue = validationArguments.object[relatedPropertyName];
          return value.getTime() < relatedValue.getTime();
        },
      },
    });
  };
};

const AfterOrEqualTime = (
  dateReturner: () => Date,
  validationOptions?: ValidationOptions,
) => {
  return (obj, propertyName: string) => {
    registerDecorator({
      name: 'isAfterOrEqualTime',
      target: obj.constructor,
      propertyName: propertyName,
      constraints: [dateReturner],
      options: validationOptions,
      validator: {
        validate(value, validationArguments?) {
          const [dateReturner] = validationArguments.constraints;
          return value.getTime() >= dateReturner().getTime();
        },
      },
    });
  };
};

const BeforeOrEqualTime = (
  dateReturner: () => Date,
  validationOptions?: ValidationOptions,
) => {
  return (obj, propertyName: string) => {
    registerDecorator({
      name: 'isBeforeOrEqualTime',
      target: obj.constructor,
      propertyName: propertyName,
      constraints: [dateReturner],
      options: validationOptions,
      validator: {
        validate(value, validationArguments?) {
          const [dateReturner] = validationArguments.constraints;
          return value.getTime() <= dateReturner().getTime();
        },
      },
    });
  };
};

export class Free {
  /**
   * The vehicle type for a given reservation.
   * @example 'Golf Cart'
   */
  @IsString()
  type: string;

  /**
   * The reservation's free period in seconds.
   * @example 1800
   */
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @PeriodExtendsLessThanRange('start', 'end', {
    message:
      'Reservation period must be less than (or equal) to the difference in seconds of the search dates',
  })
  periodSeconds: number;

  /**
   * The start date and time of a reservation.
   * @example 2022-10-04T20:33:37.029Z
   */
  @IsDate()
  @Type(() => Date)
  @IsBefore('end', {
    message: 'Start must be before end',
  })
  start: Date;

  /**
   * The end date and time of a reservation.
   * @example 2022-10-04T21:03:37.029Z
   */
  @IsDate()
  @Type(() => Date)
  @AfterOrEqualTime(() => new Date(), {
    message: 'End date must be after current time',
  })
  @BeforeOrEqualTime(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), {
    message: 'End date must be less than 7 days in the future',
  })
  end: Date;

  constructor(type: string, periodSeconds: number, start: Date, end: Date) {
    this.type = type;
    this.periodSeconds = periodSeconds;
    this.start = start;
    this.end = end;
  }
}
