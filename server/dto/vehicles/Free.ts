import { Type } from 'class-transformer';
import {
  IsDate,
  IsString,
  IsNumber,
  IsPositive,
  MinDate,
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

export class Free {
  @IsString()
  type: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @PeriodExtendsLessThanRange('start', 'end', {
    message:
      'Reservation period must be less than (or equal) to the difference in hours of the search dates',
  })
  periodSeconds: number;

  @IsDate()
  @Type(() => Date)
  @IsBefore('end', {
    message: 'Start must be before end',
  })
  start: Date;

  @IsDate()
  @Type(() => Date)
  @MinDate(new Date(), {
    message: 'End date must be after current time',
  })
  end: Date;

  constructor(type: string, periodSeconds: number, start: Date, end: Date) {
    this.type = type;
    this.periodSeconds = periodSeconds;
    this.start = start;
    this.end = end;
  }
}
