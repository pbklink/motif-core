/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Iso8601 } from './xiltyix-sysutils';
import { dateToDashedYyyyMmDd } from './utils';

// Dates on the GUI are strings. This unit provides functions to check date strings match expected formats.
/** @public */
export namespace DateText {
    // Valid date formats are:
    // - yyyy-mm-dd
    // - an empty string to specify "no date".
    export function isValidDateText(text: string): boolean {
        if (text === '') {
            return true;
        } else {
            const { nextIdx, year: ignoredYear, month, day } = Iso8601.parseDateIntoParts(text);
            if (nextIdx === -1) {
                return false;
            } else {
                return isValidMonthAndDayValue(month, day);
            }
        }
    }

    function isValidMonthAndDayValue(month: number, day: number): boolean {
        return (month >= 1 && month <= 12 && day >= 1 && day <= 31);
    }

    export function toDate(text: string, utc: boolean): Date | undefined {
        if (text === '') {
            return undefined;
        } else {
            const { nextIdx, year, month, day } = Iso8601.parseDateIntoParts(text);
            const monthIndex = month - 1;
            if (nextIdx === -1) {
                return undefined;
            } else {
                if (utc) {
                    const dateMilliseconds = Date.UTC(year, monthIndex, day);
                    return new Date(dateMilliseconds);
                } else {
                    return new Date(year, monthIndex, day);
                }
            }
        }
    }

    export function fromDate(date: Date | undefined, utc: boolean): string {
        if (date === undefined) {
            return '';
        } else {
            return dateToDashedYyyyMmDd(date, utc);
        }
    }
}

