/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Config, Decimal, Numeric } from 'decimal.js-light/decimal';
import { nanoid } from 'nanoid';
import { AssertInternalError } from './internal-error';
import { ValueRecentChangeTypeId } from './sys-revgrid-types';
import { ComparisonResult, Integer, Json, JsonValue, PriceOrRemainder, Rect, TimeSpan } from './types';

/** @public */
export const hoursPerDay = 24;
/** @public */
export const minsPerHour = 60;
/** @public */
export const secsPerMin = 60;
/** @public */
export const mSecsPerSec = 1000;
/** @public */
export const minsPerDay = hoursPerDay * minsPerHour;
/** @public */
export const secsPerDay = minsPerDay * secsPerMin;
/** @public */
export const secsPerHour = secsPerMin * minsPerHour;
/** @public */
export const mSecsPerMin = secsPerMin * mSecsPerSec;
/** @public */
export const mSecsPerHour = secsPerHour * mSecsPerSec;
/** @public */
export const mSecsPerDay = secsPerDay * mSecsPerSec;

/** @public */
export const nullDate = new Date(-100000000 * mSecsPerDay);
/** @public */
export const nullDecimal = new Decimal(-999999999999999.0);

/** @public */
export function newDate(value: Date) {
    return new Date(value.getTime());
}

/** @public */
export function newNowDate() {
    return new Date(Date.now());
}

/** @public */
export function newNullDate() {
    return new Date(nullDate);
}

/** @public */
export function newUndefinableDate(value: Date | undefined) {
    return value === undefined ? undefined : newDate(value);
}

/** @public */
export function newDecimal(value: Numeric) {
    return new Decimal(value);
}

/** @public */
export function newUndefinableDecimal(value: Numeric | undefined) {
    return value === undefined ? undefined : new Decimal(value);
}

/** @public */
export function cloneDecimal(config: Config) {
    return Decimal.clone(config);
}

/** @public */
export function newUndefinableNullableDecimal(value: Numeric | undefined | null) {
    if (value === null) {
        return null;
    } else {
        return newUndefinableDecimal(value);
    }
}

/** @public */
export function isDecimalEqual(left: Decimal, right: Decimal) {
    return left.equals(right);
}

/** @public */
export function isUndefinableDecimalEqual(left: Decimal | undefined, right: Decimal | undefined) {
    if (left === undefined) {
        return right === undefined;
    } else {
        if (right === undefined) {
            return false;
        } else {
            return isDecimalEqual(left, right);
        }
    }
}

/** @public */
export function isDecimalGreaterThan(subject: Decimal, other: Decimal) {
    return subject.greaterThan(other);
}

/** @public */
export function ifDefined<U, T>(value: U | undefined, fn: (x: U) => T): T | undefined {
    return (value === undefined) ? undefined : fn(value);
}

/** @public */
export function ifDefinedAndNotNull<U, T>(value: U | undefined | null, fn: (x: U) => T): T | undefined | null {
    if (value === undefined) {
        return undefined;
    } else {
        if (value === null) {
            return null;
        } else {
            return fn(value);
        }
    }
}

/** @public */
export function assert(value: boolean, message?: string): void {
    if (!value) {
        throw new Error(message ? message : 'Assertion failed');
    }
}

/** @public */
export function assigned<T>(value: T): value is Exclude<T, null | undefined> {
    return ((value !== null) && (value !== undefined));
}

/** @public */
export function defined<T>(value: T): value is Exclude<T, undefined> {
    return (value !== undefined);
}

/** @public */
export function delay1Tick(ftn: () => void) {
    return setTimeout(() => ftn(), 0);
}

/** @public */
export function delay2Ticks(ftn: () => void) {
    setTimeout(() => delay1Tick(ftn), 0);
}

/** @public */
export function numberToPixels(value: number) {
    return value.toString(10) + 'px';
}

// sleep() returns after ms seconds.
/** @public */
export async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/** @public */
export class TUID {
    private static _lastId = Number.MIN_SAFE_INTEGER;
    static getUID(): number {
        if (TUID._lastId >= Number.MAX_SAFE_INTEGER - 1) {
            throw new AssertInternalError('Cannot return UID. All available UIDs used. [ID:10401105649]');
        }
        return ++TUID._lastId;
    }
}

/** @public */
export class TTypeGuard {
    static isString(x: unknown): x is string {
        return typeof x === 'string';
    }

    static isNumber(x: unknown): x is number {
        return typeof x === 'number';
    }
}

/** @public */
export function compareValue<T extends number | string>(left: T, right: T) {
    if (left < right) {
        return ComparisonResult.LeftLessThanRight;
    } else {
        if (left > right) {
            return ComparisonResult.LeftGreaterThanRight;
        } else {
            return ComparisonResult.LeftEqualsRight;
        }
    }
}

/** @public */
export function compareNumber(left: number, right: number) {
    if (left < right) {
        return ComparisonResult.LeftLessThanRight;
    } else {
        if (left > right) {
            return ComparisonResult.LeftGreaterThanRight;
        } else {
            return ComparisonResult.LeftEqualsRight;
        }
    }
}

/** @public */
export function compareUndefinableNumber(left: number | undefined, right: number | undefined, undefinedIsLowest: boolean) {
    if (left === undefined) {
        if (right === undefined) {
            return ComparisonResult.LeftEqualsRight;
        } else {
            return undefinedIsLowest ? ComparisonResult.LeftLessThanRight : ComparisonResult.LeftGreaterThanRight;
        }
    } else {
        if (right === undefined) {
            return undefinedIsLowest ? ComparisonResult.LeftGreaterThanRight : ComparisonResult.LeftLessThanRight;
        } else {
            return compareNumber(left, right);
        }
    }
}

/** @public */
export function compareInteger(left: Integer, right: Integer) {
    if (left < right) {
        return ComparisonResult.LeftLessThanRight;
    } else {
        if (left > right) {
            return ComparisonResult.LeftGreaterThanRight;
        } else {
            return ComparisonResult.LeftEqualsRight;
        }
    }
}

/** @public */
export function priorityCompareInteger(left: Integer, right: Integer, priority: Integer) {
    if (left === priority) {
        return right === priority ? ComparisonResult.LeftEqualsRight : ComparisonResult.LeftLessThanRight;
    } else {
        if (right === priority) {
            return ComparisonResult.LeftGreaterThanRight;
        } else {
            if (left < right) {
                return ComparisonResult.LeftLessThanRight;
            } else {
                if (left > right) {
                    return ComparisonResult.LeftGreaterThanRight;
                } else {
                    return ComparisonResult.LeftEqualsRight;
                }
            }
        }
    }
}

/** @public */
export function compareUndefinableInteger(left: Integer | undefined, right: Integer | undefined, undefinedIsLowest: boolean) {
    if (left === undefined) {
        if (right === undefined) {
            return ComparisonResult.LeftEqualsRight;
        } else {
            return undefinedIsLowest ? ComparisonResult.LeftLessThanRight : ComparisonResult.LeftGreaterThanRight;
        }
    } else {
        if (right === undefined) {
            return undefinedIsLowest ? ComparisonResult.LeftGreaterThanRight : ComparisonResult.LeftLessThanRight;
        } else {
            return compareInteger(left, right);
        }
    }
}

/** @public */
export function compareEnum<T extends number>(left: T, right: T): number {
    if (left < right) {
        return ComparisonResult.LeftLessThanRight;
    } else {
        if (left > right) {
            return ComparisonResult.LeftGreaterThanRight;
        } else {
            return ComparisonResult.LeftEqualsRight;
        }
    }
}

/** @public */
export function compareUndefinableEnum<T extends number>(left: T | undefined, right: T | undefined, undefinedIsLowest: boolean) {
    if (left === undefined) {
        if (right === undefined) {
            return ComparisonResult.LeftEqualsRight;
        } else {
            return undefinedIsLowest ? ComparisonResult.LeftLessThanRight : ComparisonResult.LeftGreaterThanRight;
        }
    } else {
        if (right === undefined) {
            return undefinedIsLowest ? ComparisonResult.LeftGreaterThanRight : ComparisonResult.LeftLessThanRight;
        } else {
            return compareEnum(left, right);
        }
    }
}

/** @public */
export function compareDecimal(left: Decimal, right: Decimal): number {
    if (left.lessThan(right)) {
        return ComparisonResult.LeftLessThanRight;
    } else {
        if (left.greaterThan(right)) {
            return ComparisonResult.LeftGreaterThanRight;
        } else {
            return ComparisonResult.LeftEqualsRight;
        }
    }
}

/** @public */
export function compareUndefinableDecimal(left: Decimal | undefined, right: Decimal | undefined, undefinedIsLowest: boolean) {
    if (left === undefined) {
        if (right === undefined) {
            return ComparisonResult.LeftEqualsRight;
        } else {
            return undefinedIsLowest ? ComparisonResult.LeftLessThanRight : ComparisonResult.LeftGreaterThanRight;
        }
    } else {
        if (right === undefined) {
            return undefinedIsLowest ? ComparisonResult.LeftGreaterThanRight : ComparisonResult.LeftLessThanRight;
        } else {
            return compareDecimal(left, right);
        }
    }
}

/** @public */
export function compareString(left: string, right: string): number {
    if (left < right) {
        return ComparisonResult.LeftLessThanRight;
    } else {
        if (left > right) {
            return ComparisonResult.LeftGreaterThanRight;
        } else {
            return ComparisonResult.LeftEqualsRight;
        }
    }
}

/** @public */
export function compareUndefinableString(left: string | undefined, right: string | undefined, undefinedIsLowest: boolean) {
    if (left === undefined) {
        if (right === undefined) {
            return ComparisonResult.LeftEqualsRight;
        } else {
            return undefinedIsLowest ? ComparisonResult.LeftLessThanRight : ComparisonResult.LeftGreaterThanRight;
        }
    } else {
        if (right === undefined) {
            return undefinedIsLowest ? ComparisonResult.LeftGreaterThanRight : ComparisonResult.LeftLessThanRight;
        } else {
            return compareString(left, right);
        }
    }
}

/** @public */
export function compareBoolean(left: boolean, right: boolean): number {
    if (left === right) {
        return ComparisonResult.LeftEqualsRight;
    } else {
        if (left) {
            return ComparisonResult.LeftGreaterThanRight;
        } else {
            return ComparisonResult.LeftLessThanRight;
        }
    }
}

/** @public */
export function compareUndefinableBoolean(left: boolean | undefined, right: boolean | undefined, undefinedIsLowest: boolean) {
    if (left === undefined) {
        if (right === undefined) {
            return ComparisonResult.LeftEqualsRight;
        } else {
            return undefinedIsLowest ? ComparisonResult.LeftLessThanRight : ComparisonResult.LeftGreaterThanRight;
        }
    } else {
        if (right === undefined) {
            return undefinedIsLowest ? ComparisonResult.LeftGreaterThanRight : ComparisonResult.LeftLessThanRight;
        } else {
            return compareBoolean(left, right);
        }
    }
}

/** @public */
export function comparePriceOrRemainder(left: PriceOrRemainder, right: PriceOrRemainder, lowToHighSorting: boolean) {
    if (left === null) {
        if (right === null) {
            return ComparisonResult.LeftEqualsRight;
        } else {
            return lowToHighSorting ? ComparisonResult.LeftGreaterThanRight : ComparisonResult.LeftLessThanRight;
        }
    } else {
        if (right === null) {
            return lowToHighSorting ? ComparisonResult.LeftLessThanRight : ComparisonResult.LeftGreaterThanRight;
        } else {
            if (lowToHighSorting) {
                return compareDecimal(left, right);
            } else {
                return compareDecimal(right, left);
            }
        }
    }
}

/** @public */
export function isPriceOrRemainderEqual(left: PriceOrRemainder, right: PriceOrRemainder) {
    if (left === null) {
        return right === null ? true : false;
    } else {
        if (right === null) {
            return false;
        } else {
            return isDecimalEqual(left, right);
        }
    }
}

/** @public */
export function concatenateArrayUniquely<T>(left: readonly T[], right: readonly T[]): T[] {
    const maxLength = left.length + right.length;
    const result = new Array<T>(maxLength);
    for (let i = 0; i < left.length; i++) {
        result[i] = left[i];
    }
    let idx = left.length;
    for (let i = 0; i < right.length; i++) {
        const value = right[i];
        if (!result.includes(value)) {
            result[idx++] = value;
        }
    }
    result.length = idx;
    return result;
}

/** @public */
export function concatenateElementToArrayUniquely<T>(array: readonly T[], element: T) {
    const result = array.slice();
    if (!array.includes(element)) {
        result.push(element);
    }
    return result;
}

/** @public */
export function subtractElementFromArray<T>(array: readonly T[], element: T) {
    const result = array.slice();
    const count = result.length;
    for (let i = count - 1; i >= 0; i--) {
        if (result[i] === element) {
            result.splice(i, 1);
        }
    }
    return result;
}

/** Assumes array has at most one instance of element
 * @public
 */
export function subtractElementFromArrayUniquely<T>(array: readonly T[], element: T) {
    const result = array.slice();
    const count = array.length;
    for (let i = count - 1; i >= 0; i--) {
        if (result[i] === element) {
            result.splice(i, 1);
            break;
        }
    }
    return result;
}

/** @public */
export function addToArrayByPush<T>(target: T[], addition: readonly T[]) {
    for (let i = 0; i < addition.length; i++) {
        const element = addition[i];
        target.push(element);
    }
}

/** @public */
export function addToArrayUniquely<T>(target: T[], addition: readonly T[]) {
    let additionIdx = target.length;
    target.length += addition.length;
    for (let i = 0; i < addition.length; i++) {
        const value = addition[i];
        if (!target.includes(value)) {
            target[additionIdx++] = value;
        }
    }
    target.length = additionIdx;
}

/** @public */
export function addToCapacitisedArrayUniquely<T>(target: T[], count: Integer, addition: readonly T[]) {
    const additionCount = addition.length;
    const maxNewCount = count + additionCount;
    if (maxNewCount > target.length) {
        target.length = maxNewCount;
    }
    for (let i = 0; i < additionCount; i++) {
        const value = addition[i];
        if (!target.includes(value)) {
            target[count++] = value;
        }
    }
    return count;
}

/** @public */
export function addToGrow15ArrayUniquely<T>(target: T[], count: Integer, addition: readonly T[]) {
    const additionCount = addition.length;
    const maxNewCount = count + additionCount;
    if (maxNewCount > target.length) {
        target.length = maxNewCount + 15;
    }
    for (let i = 0; i < additionCount; i++) {
        const value = addition[i];
        if (!target.includes(value)) {
            target[count++] = value;
        }
    }
    return count;
}

/** @public */
export function compareDate(left: Date, right: Date) {
    const leftTime = left.getTime();
    const rightTime = right.getTime();
    if (leftTime === rightTime) {
        return ComparisonResult.LeftEqualsRight;
    } else {
        if (leftTime > rightTime) {
            return ComparisonResult.LeftGreaterThanRight;
        } else {
            return ComparisonResult.LeftLessThanRight;
        }
    }
}

/** @public */
export function compareUndefinableDate(left: Date | undefined, right: Date | undefined, undefinedIsLowest: boolean) {
    if (left === undefined) {
        if (right === undefined) {
            return ComparisonResult.LeftEqualsRight;
        } else {
            return undefinedIsLowest ? ComparisonResult.LeftLessThanRight : ComparisonResult.LeftGreaterThanRight;
        }
    } else {
        if (right === undefined) {
            return undefinedIsLowest ? ComparisonResult.LeftGreaterThanRight : ComparisonResult.LeftLessThanRight;
        } else {
            return compareDate(left, right);
        }
    }
}

/** @public */
export function isDateEqual(left: Date, right: Date) {
    return left.getTime() === right.getTime();
}

/** @public */
export function isUndefinableDateEqual(left: Date | undefined, right: Date | undefined) {
    if (left === undefined) {
        return right === undefined;
    } else {
        if (right === undefined) {
            return false;
        } else {
            return isDateEqual(left, right);
        }
    }
}

/** @public */
export function isArrayEqual<T>(left: readonly T[], right: readonly T[]): boolean {
    const length = left.length;
    if (right.length !== length) {
        return false;
    } else {
        for (let i = 0; i < length; i++) {
            if (left[i] !== right[i]) {
                return false;
            }
        }
        return true;
    }
}

/** @public */
export function isUndefinableArrayEqualUniquely<T>(left: readonly T[] | undefined, right: readonly T[] | undefined): boolean {
    if (left === undefined) {
        return right === undefined;
    } else {
        if (right === undefined) {
            return false;
        } else {
            return isArrayEqualUniquely(left, right);
        }
    }
}

/** @public */
export function isArrayEqualUniquely<T>(left: readonly T[], right: readonly T[]): boolean {
    const length = left.length;
    if (right.length !== length) {
        return false;
    } else {
        for (let i = 0; i < length; i++) {
            if (!left.includes(right[i])) {
                return false;
            }
        }
        return true;
    }
}

/** @public */
export function isSamePossiblyUndefinedArray<T>(left?: readonly T[], right?: readonly T[]): boolean {
    if (left === undefined) {
        return right === undefined;
    } else {
        return right === undefined ? true : isArrayEqual(left, right);
    }
}

/** @public */
export function compareArray<T>(left: readonly T[], right: readonly T[]): number {
    // Compare matching element in order. If elements differ, return result of element comparison.
    // If arrays have different length but common indexes have same elements, then return comparison of lengths.
    let shorterArray: readonly T[];
    let longerArray: readonly T[];
    let leftIsShorter: boolean;
    let result = 0;

    if (left.length < right.length) {
        shorterArray = left;
        longerArray = right;
        leftIsShorter = true;
    } else {
        shorterArray = right;
        longerArray = left;
        leftIsShorter = false;
    }

    const elementsTheSame = shorterArray.every((element: T, index: Integer) => {
        const longerElement = longerArray[index];
        if (element === longerElement) {
            return true;
        } else {
            result = (element < longerElement) ? ComparisonResult.LeftLessThanRight : 1;
            return false;
        }
    });

    if (!elementsTheSame) {
        return leftIsShorter ? result : result * -1;
    } else {
        if (left.length === right.length) {
            return ComparisonResult.LeftEqualsRight;
        } else {
            return leftIsShorter ? ComparisonResult.LeftLessThanRight : 1;
        }
    }
}

// export function CompareAnyDescending(Left: any, Right: any): number {
//     // #TestingRequired:
//     if (Left === undefined) {
//         if (Right === undefined) {
//             return 0;
//         } else {
//             return -1;
//         }
//     } else if (Right === undefined) {
//         return 1;
//     }

//     if (Left === null) {
//         if (Right === null) {
//             return 0;
//         } else {
//             return -1;
//         }
//     } else if (Right === null) {
//         return 1;
//     }

//     return CompareAny(Right, Left);
// }

// export function CompareAny(Left: any, Right: any): number {
//     // #TestingRequired:

//     if (Left === undefined) {
//         if (Right === undefined) {
//             return 0;
//         } else {
//             return -1;
//         }
//     } else if (Right === undefined) {
//         return 1;
//     }

//     if (Left === null) {
//         if (Right === null) {
//             return 0;
//         } else {
//             return -1;
//         }
//     } else if (Right === null) {
//         return 1;
//     }

//     if (typeof Left !== typeof Right) {
//         throw new AssertInternalError('Left and right are different types can cannot be compared.');
//     }

//     switch (typeof Left) {
//         case 'string':
//             return CompareString(Left as string, Right as string);

//         case 'number':
//             return CompareNumber(Left as number, Right as number);

//         case 'boolean':
//             return CompareBoolean(Left as boolean, Right as boolean);

//         case 'object':
//             // TODO:LOW There might be a better way then using comparing strings.
//             return CompareString(JSON.stringify(Left), JSON.stringify(Right));

//         default:
//             throw new AssertInternalError('Case statement not handled ID:17923135858');
//     }

// }

/** @public */
export function copyJson(obj: Json) {
    return deepExtendObject({}, obj) as Json;
}

/** @public */
export function copyJsonValue(value: JsonValue) {
    return deepExtendValue({}, value) as JsonValue;
}

/** @public */
export function deepExtendObject(target: Record<string, unknown>, obj: Record<string, unknown> | undefined): Record<string, unknown> {
    if (obj !== undefined) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                const existingTarget = target[key];
                target[key] = deepExtendValue(existingTarget, value);
            }
        }
    }

    return target;
}

/** @public */
export function deepExtendValue(existingTarget: unknown, value: unknown): unknown {
    if (typeof value !== 'object') {
        return value;
    } else {
        if (value instanceof Array) {
            const length = value.length;
            const targetArray = new Array<unknown>(length);
            for (let i = 0; i < length; i++) {
                const element = value[i];
                targetArray[i] = deepExtendValue({}, element);
            }
            return targetArray;
        } else {
            if (value === null) {
                return null;
            } else {
                const valueObj = value as Record<string, unknown>;
                if (existingTarget === undefined) {
                    return deepExtendObject({}, valueObj); // overwrite
                } else {
                    if (typeof existingTarget !== 'object') {
                        return deepExtendObject({}, valueObj); // overwrite
                    } else {
                        if (existingTarget instanceof Array) {
                            return deepExtendObject({}, valueObj); // overwrite
                        } else {
                            if (existingTarget === null) {
                                return deepExtendObject({}, valueObj); // overwrite
                            } else {
                                const existingTargetObj = existingTarget as Record<string, unknown>;
                                return deepExtendObject(existingTargetObj, valueObj); // merge
                            }
                        }
                    }
                }
            }
        }
    }
}

/** @public */
export function isDigit(charCode: number) {
    return charCode > 47 && charCode <  58;
}

/** @public */
export const isIntegerRegex = /^-?\d+$/;

/** @public */
export function parseIntStrict(value: string) {
    return isIntegerRegex.test(value) ? parseInt(value, 10) : undefined;
}

/** @public */
export const isNumberRegex = /^\d*\.?\d*$/;

/** @public */
export function parseNumberStrict(value: string) {
    return isNumberRegex.test(value) ? Number(value) : undefined;
}

/** @public */
export function getErrorMessage(e: unknown): string {
    if (e instanceof Error) {
        return e.message;
    } else {
        if (typeof e === 'string') {
            return e;
        } else {
            return 'Unknown Error';
        }
    }
}

/** @public */
export namespace SysTick {
    export type Time = number;
    export type Span = TimeSpan;

    export function now(): number {
        // performance.now() returns milliseconds elapsed since the 'time origin'.
        // https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
        return performance.now();
    }

    export function toDate(time: Time): Date {
        const nowSpan = time + performance.timeOrigin;
        return new Date(nowSpan);
    }

    export function nowDate(): Date {
        return toDate(now());
    }

    export function compare(left: Time, right: Time): Span {
        return compareNumber(left, right);
    }

    export const MaxSpan = Number.MAX_SAFE_INTEGER;
}

/** @public */
export namespace ValueRecentChangeType {
    /** Assumes oldValue and newValue are different */
    export function calculateChangeTypeId<T>(oldValue: T | undefined, newValue: T | undefined) {
        if (oldValue === undefined || newValue === undefined) {
            return ValueRecentChangeTypeId.Update;
        } else {
            return newValue > oldValue ? ValueRecentChangeTypeId.Increase : ValueRecentChangeTypeId.Decrease;
        }
    }
}

/** @public */
export type OptionalKeys<T> = {
    [P in keyof T]?: T[P] | undefined;
};

/** @public */
export type OptionalValues<T> = {
    [P in keyof T]: T[P] | undefined;
};

/** @public */
// eslint-disable-next-line @typescript-eslint/ban-types
export function getObjectPropertyValue(object: Object, propertyKey: string) {
    const entries = Object.entries(object);
    for (const entry of entries) {
        const [key, value] = entry;
        if (key === propertyKey) {
            return value;
        }
    }
    return undefined;
}

/** @public */
export function dateToUtcYYYYMMDD(value: Date) {
    const year = value.getUTCFullYear();
    const yearStr = year.toString(10);
    const month = value.getUTCMonth();
    let monthStr = month.toString(10);
    if (monthStr.length === 1) {
        monthStr = '0' + monthStr;
    }
    const dayOfMonth = value.getUTCDate();
    let dayOfMonthStr = dayOfMonth.toString(10);
    if (dayOfMonthStr.length === 1) {
        dayOfMonthStr = '0' + dayOfMonthStr;
    }

    return yearStr + monthStr + dayOfMonthStr;
}

/** @public */
export function isToday(date: Date): boolean {
    const now = new Date();
    if (now.getDate() !== date.getDate()) {
        return false;
    }
    if (now.getMonth() !== date.getMonth()) {
        return false;
    }
    if (now.getFullYear() !== date.getFullYear()) {
        return false;
    }
    return true;
}

/** @public */
export function isSameDay(dateA: Date, dateB: Date): boolean {
    if (dateA.getDate() !== dateB.getDate()) {
        return false;
    }
    if (dateA.getMonth() !== dateB.getMonth()) {
        return false;
    }
    if (dateA.getFullYear() !== dateB.getFullYear()) {
        return false;
    }
    return true;
}

/** @public */
export function addDays(date: Date, count: Integer) {
    const result = new Date(date.getTime());
    result.setDate(result.getDate() + count);
    return result;
}

/** @public */
export function incDateByDays(date: Date, count: Integer) {
    date.setDate(date.getDate() + count);
}

/** @public */
export function dateToDateOnlyIsoString(value: Date) {
    const year = value.getUTCFullYear();
    const yearStr = year.toFixed(0);
    const yearStrLength = yearStr.length;
    if (yearStrLength < 4) {
        yearStr.padStart(4 - yearStrLength, '0');
    }

    const month = value.getUTCMonth() + 1;
    let monthStr = month.toFixed(0);
    if (monthStr.length === 1) {
        monthStr = '0' + monthStr;
    }

    const dayOfMonth = value.getUTCDate();
    let dayOfMonthStr = dayOfMonth.toFixed(0);
    if (dayOfMonthStr.length === 1) {
        dayOfMonthStr = '0' + dayOfMonthStr;
    }

    // Note that Date.parse() interprets this as UTC
    return yearStr + '-' + monthStr + '-' + dayOfMonthStr;
}

/** @public */
export function moveElementInArray<T>(array: T[], fromIndex: Integer, toIndex: Integer) {
    const element = array[fromIndex];
    if (fromIndex < toIndex) {
        for (let i = fromIndex; i < toIndex; i++) {
            array[i] = array[i + 1];
        }
    } else {
        for (let i = fromIndex; i > toIndex; i--) {
            array[i] = array[i - 1];
        }
    }
    array[toIndex] = element;
}

/** @public */
export function uniqueElementArraysOverlap<T>(left: readonly T[], right: readonly T[]) {
    // order of elements is ignored
    for (let i = 0; i < left.length; i++) {
        if (right.includes(left[i])) {
            return true;
        }
    }
    return false;
}

/** @public */
export function getUniqueElementArraysOverlapElements<T>(left: readonly T[], right: readonly T[]) {
    const result: T[] = [];
    for (let i = 0; i < left.length; i++) {
        const element = left[i];
        if (right.includes(element)) {
            result.push(element);
        }
    }
    return result;
}

/** @public */
export function getElementDocumentPosition(element: HTMLElement): { left: number; top: number } {
    const domRect = element.getBoundingClientRect();
    return {
        left: domRect.left + window.scrollX,
        top: domRect.top + window.scrollY,
    };


    // let xPos = 0;
    // let yPos = 0;

    // while (element !== null) {
    //     if (element.tagName === 'BODY') {
    //         // deal with browser quirks with body/window/document and page scroll
    //         const xScroll = element.scrollLeft || document.documentElement.scrollLeft;
    //         const yScroll = element.scrollTop || document.documentElement.scrollTop;

    //         xPos += (element.offsetLeft - xScroll + element.clientLeft);
    //         yPos += (element.offsetTop - yScroll + element.clientTop);
    //     } else {
    //         // for all other non-BODY elements
    //         xPos += (element.offsetLeft - element.scrollLeft + element.clientLeft);
    //         yPos += (element.offsetTop - element.scrollTop + element.clientTop);
    //     }

    //     element = element.offsetParent as HTMLElement;
    // }

    // return {
    //     left: xPos,
    //     top: yPos
    // };
}

/** @public */
export function getElementDocumentPositionRect(element: HTMLElement): Rect {
    const domRect = element.getBoundingClientRect();
    return {
        left: domRect.left + window.scrollX,
        top: domRect.top + window.scrollY,
        width: domRect.width,
        height: domRect.height,
    };
}

/** @public */
export function createRandomUrlSearch() {
    return '?random=' + Date.now().toString(36) + nanoid();
}

// Latest TypeScript library now support RequestIdleCallback however not yet used by Angular
// Remove below when Angular uses the version of TypeScript which supports this
/** @public */
export type RequestIdleCallbackHandle = number;
/** @public */
export interface IdleRequestOptions {
    timeout?: number;
}
/** @public */
export interface IdleDeadline {
    readonly didTimeout: boolean;
    timeRemaining(): DOMHighResTimeStamp;
}

/** @public */
type IdleRequestCallback = (deadline: IdleDeadline) => void;

/** @public */
declare global {
    interface Window {
        // Flagged as experimental so not yet in Typescript.  Remove when included in Typescript
        requestIdleCallback: ((
            callback: IdleRequestCallback,
            opts?: IdleRequestOptions,
        ) => RequestIdleCallbackHandle);
        cancelIdleCallback: ((handle: RequestIdleCallbackHandle) => void);
    }
}

// export function simulatedRequestIdleCallback(
//     callback: RequestIdleCallbackFunction,
//     opts?: RequestIdleCallbackOptions,
// ) {
//     const defaultTimeout = 5 * mSecsPerSec;
//     const deadline: RequestIdleCallbackDeadline = {
//         didTimeout: true,
//         timeRemaining: () => 50, // default initial timeRemaining as of August 2019
//     };
//     let timeout: Integer;
//     if (opts === undefined) {
//         timeout = defaultTimeout;
//     } else {
//         if (opts.timeout === undefined) {
//             timeout = defaultTimeout;
//         } else {
//             timeout = opts.timeout;
//         }
//     }
//     setTimeout(() => callback(deadline), timeout);
// }

// export function simulatedCancelIdleCallback(handle: RequestIdleCallbackHandle) {
//     // cannot cancel setTimeout so do nothing
// }
