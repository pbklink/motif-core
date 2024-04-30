/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevRecordValueRecentChangeTypeId } from '@xilytix/revgrid';
import { ComparisonResult, compareDecimal, isDecimalEqual } from '@xilytix/sysutils';
import { PriceOrRemainder } from './types';
export {
    IntlNumberFormatCharParts,
    OptionalKeys,
    OptionalValues,
    SysTick,
    addDays,
    addToArrayByPush,
    addToArrayUniquely,
    addToCapacitisedArrayUniquely,
    addToGrow15ArrayUniquely,
    calculateIntlNumberFormatCharParts,
    checkEscapeCharForRegexInsideCharClass,
    checkEscapeCharForRegexOutsideCharClass,
    checkLimitTextLength,
    cloneDecimal,
    compareArray,
    compareBoolean,
    compareDate,
    compareDecimal,
    compareEnum,
    compareInteger,
    compareNumber,
    compareString,
    compareUndefinableBoolean,
    compareUndefinableDate,
    compareUndefinableDecimal,
    compareUndefinableEnum,
    compareUndefinableInteger,
    compareUndefinableNumber,
    compareUndefinableString,
    compareValue,
    concatenateArrayUniquely,
    concatenateElementToArrayUniquely,
    copyJson,
    copyJsonValue,
    createNumberGroupCharRemoveRegex,
    createRandomUrlSearch,
    dateToDashedYyyyMmDd,
    dateToDateOnlyIsoString,
    dateToUtcYyyyMmDd,
    deepExtendObject,
    deepExtendValue,
    delay1Tick,
    getElementDocumentPosition,
    getElementDocumentPositionRect,
    getErrorMessage,
    getUniqueElementArraysOverlapElements,
    hoursPerDay,
    incDateByDays,
    isArrayEqual,
    isArrayEqualUniquely,
    isDateEqual,
    isDecimalEqual,
    isDecimalGreaterThan,
    isDecimalLessThan,
    isDigitCharCode,
    isIntlFormattedInteger,
    isIntlFormattedNumber,
    isPartialIntlFormattedInteger,
    isPartialIntlFormattedNumber,
    isSameDay,
    isSamePossiblyUndefinedArray,
    isStringKeyValueObjectEqual,
    isStringifiedInteger,
    isStringifiedNumber,
    isToday,
    isUndefinableArrayEqual,
    isUndefinableArrayEqualUniquely,
    isUndefinableDateEqual,
    isUndefinableDecimalEqual,
    mSecsPerDay,
    mSecsPerHour,
    mSecsPerMin,
    mSecsPerSec,
    minsPerDay,
    minsPerHour,
    moveElementInArray,
    moveElementsInArray,
    moveIndexedElementsInArrayOnePositionTowardsEndWithSquash,
    moveIndexedElementsInArrayOnePositionTowardsStartWithSquash,
    newDate,
    newDecimal,
    newGuid,
    newNowDate,
    newNullDate,
    newUndefinableDate,
    newUndefinableDecimal,
    newUndefinableNullableDecimal,
    nullDate,
    nullDecimal,
    numberToPixels,
    parseIntStrict,
    parseNumberStrict,
    priorityCompareInteger,
    removeFromArray,
    secsPerDay,
    secsPerHour,
    secsPerMin,
    shuffleElementsUpInArray,
    subtractElementFromArray,
    subtractElementFromArrayUniquely,
    testRemoveFromArray,
    tryGetErrorMessage,
    uniqueElementArraysOverlap
} from './xilytix-sysutils';

/** @public */
export function ifDefined<U, T>(value: U | undefined, fn: (x: U) => T): T | undefined {
    return (value === undefined) ? undefined : fn(value);
}

/** @public */
export function getUndefinedNullOrFunctionResult<U, T>(value: U | undefined | null, fn: (x: U) => T): T | undefined | null {
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

export function isUndefinableStringNumberBooleanNestArrayEqual(left: unknown[] | undefined, right: unknown[] | undefined) {
    if (left === undefined) {
        return right === undefined;
    } else {
        if (right === undefined) {
            return false;
        } else {
            return isStringNumberBooleanNestArrayEqual(left, right);
        }
    }
}

export function isStringNumberBooleanNestArrayEqual(left: unknown[], right: unknown[]) {
    const leftCount = left.length;
    const rightCount = right.length;
    if (leftCount !== rightCount) {
        return false;
    } else {
        for (let i = 0; i < leftCount; i++) {
            if (!isStringNumberBooleanNestArrayElementEqual(left[i], right[i])) {
                return false;
            }
        }
        return true;
    }
}

export function isStringNumberBooleanNestArrayElementEqual(leftElement: unknown, rightElement: unknown) {
    if (Array.isArray(leftElement)) {
        if (Array.isArray(rightElement)) {
            return isStringNumberBooleanNestArrayEqual(leftElement, rightElement);
        } else {
            return false;
        }
    } else {
        if (Array.isArray(rightElement)) {
            return false;
        } else {
            const leftElementType = typeof leftElement;
            const rightElementType = typeof rightElement;
            switch (leftElementType) {
                case 'string': return rightElementType === 'string' && leftElement === rightElement;
                case 'number': return rightElementType === 'number' && leftElement === rightElement;
                case 'boolean': return rightElementType === 'boolean' && leftElement === rightElement;
                default: return false;
            }
        }
    }
}
/** @public */
export namespace ValueRecentChangeType {
    /** Assumes oldValue and newValue are different */
    export function calculateChangeTypeId(oldValue: number | undefined, newValue: number | undefined): RevRecordValueRecentChangeTypeId {
        if (oldValue === undefined || newValue === undefined) {
            return RevRecordValueRecentChangeTypeId.Update;
        } else {
            return newValue > oldValue ? RevRecordValueRecentChangeTypeId.Increase : RevRecordValueRecentChangeTypeId.Decrease;
        }
    }
}

