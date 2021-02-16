declare module '*.jpeg';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.png';
declare module '*.svg';
declare module '*.json';

import { Dayjs } from 'dayjs'
type DateType = string | number | Date | Dayjs

// @Todo: review if there is a better support for this.
declare module 'dayjs' {
  interface Dayjs {
    fromNow(withoutSuffix?: boolean): string
    from(compared: DateType, withoutSuffix?: boolean): string
    toNow(withoutSuffix?: boolean): string
    to(compared: DateType, withoutSuffix?: boolean): string
  }
}