/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Iso8601 } from './iso8601';
import { ComparisonResult, Integer } from './types';
import { compareDate, dateToUtcYYYYMMDD, isDateEqual, mSecsPerMin, newDate } from './utils';

/** @public */
export interface SourceTzOffsetDate {
    readonly utcMidnight: Date; // This must always be midnight
    readonly offset: Integer;
}

/** @public */
export namespace SourceTzOffsetDate {
    /** Adjusts the time so that it is midnight in local timezone.  Only use for display */
    export function getAsMidnightLocalTimeDate(value: SourceTzOffsetDate) {
        const utcDate = value.utcMidnight;
        return new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * mSecsPerMin);
    }

    export function createCopy(value: SourceTzOffsetDate): SourceTzOffsetDate {
        return {
            utcMidnight: value.utcMidnight,
            offset: value.offset,
        };
    }

    export function createFromIso8601(value: string) {
        const parseResult = Iso8601.parseZenith(value);
        if (parseResult === undefined) {
            return undefined;
        } else {
            const result: SourceTzOffsetDate = {
                utcMidnight: parseResult.utcDate,
                offset: parseResult.offset,
            };
            return result;
        }
    }

    export function createFromUtcDate(value: Date): SourceTzOffsetDate {
        const utcMidnightDate = newDate(value);
        utcMidnightDate.setUTCHours(0, 0, 0, 0);
        const offset = -(value.getTimezoneOffset() * mSecsPerMin);
        return {
            utcMidnight: utcMidnightDate, // Internally dates are always utc
            offset,
        };
    }

    export function createFromLocalDate(value: Date): SourceTzOffsetDate {
        const midnightDate = newDate(value);
        midnightDate.setHours(0, 0, 0, 0);
        const offset = -(value.getTimezoneOffset() * mSecsPerMin);
        const utcMidnightDate = new Date(midnightDate.getTime() - offset);
        return {
            utcMidnight: utcMidnightDate, // Internally dates are always utc
            offset,
        };
    }

    export function newUndefinable(value: SourceTzOffsetDate | undefined) {
        if (value === undefined) {
            return undefined;
        } else {
            return createCopy(value);
        }
    }

    export function toUtcYYYYMMDDString(value: SourceTzOffsetDate) {
        return dateToUtcYYYYMMDD(value.utcMidnight);
    }

    export function isEqual(left: SourceTzOffsetDate, right: SourceTzOffsetDate) {
        // assumes that utcDates are always midnight
        return isDateEqual(left.utcMidnight, right.utcMidnight) && left.offset === right.offset;
    }

    export function isUndefinableEqual(left: SourceTzOffsetDate | undefined, right: SourceTzOffsetDate | undefined) {
        if (left === undefined) {
            return right === undefined;
        } else {
            return right === undefined ? false : isEqual(left, right);
        }
    }

    export function compare(left: SourceTzOffsetDate, right: SourceTzOffsetDate): ComparisonResult {
        // assumes that utcDates are always midnight
        return compareDate(left.utcMidnight, right.utcMidnight);
    }

    export function compareUndefinable(left: SourceTzOffsetDate | undefined,
            right: SourceTzOffsetDate | undefined,
            undefinedIsLowest: boolean): ComparisonResult {
        if (left === undefined) {
            if (right === undefined) {
                return 0;
            } else {
                return undefinedIsLowest ? -1 : 1;
            }
        } else {
            if (right === undefined) {
                return undefinedIsLowest ? 1 : -1;
            } else {
                return compare(left, right);
            }
        }
    }
}
