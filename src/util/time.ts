import moment, { Moment } from 'moment';
import _ from 'lodash';

export const LINK_DATEFORMAT = 'YYYY-MM-DD';

export function formatHumanDate(date: Moment): string {
  return date.format('dddd LL');
}

export function today(): string {
  return moment().format(LINK_DATEFORMAT);
}

export function isFuture(momentDate: Moment): boolean {
  // TODO: change to moment() aka today
  return moment(today()).diff(momentDate, 'days') < 0;
}

export function isToday(momentDate: Moment): boolean {
  return moment(today()).diff(momentDate, 'days') == 0;
}

export function minutesToHours(minutes: number): number {
  return minutes / 60;
}

export function hoursToMinutes(hours: number | string): number {
  let parsedHours = hours;
  if (typeof hours !== 'number') {
    parsedHours = Number.parseFloat(hours);
  }
  return Math.floor((parsedHours as number) * 60);
}

export function formatHours(hours: number): string | number {
  const full = Math.trunc(hours);
  const fract = hours % 1;
  let fractString: string;
  switch (fract) {
    case 0.75: fractString = String.fromCodePoint(190); break;
    case 0.5: fractString = String.fromCodePoint(189); break;
    case 0.25: fractString = String.fromCodePoint(188); break;
    case 0: fractString = ''; break;
    default: return hours;
  }
  return `${full}${fractString}`;
}

export function round(floatVal: number, stepOption: number = 0.25): number {
  if (1 % stepOption != 0) {
    return floatVal;
  }

  const num = floatVal.toFixed(2);
  const whole = Math.floor(floatVal);
  const fract = Number.parseFloat(num) - whole;

  let returnValue: number | null = null;
  const steps = _.range(stepOption/2, 1, stepOption);
  for (let i = 0; i < steps.length; i++) {
    if (fract < steps[i]) {
      returnValue = whole + stepOption * i;
      break;
    }
  }
  returnValue ??= whole + 1;
  if (returnValue > 18) {
    returnValue = 18;
  }
  return returnValue;
}