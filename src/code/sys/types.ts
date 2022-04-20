/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from 'decimal.js-light';

/** @public */
export type Integer = number;

/** @public */
export type Guid = string;
/** @public */
export type BooleanOrUndefined = boolean | undefined;

/** @public */
export type DateOrDateTime = Date;
/** @public */
export type TimeSpan = number;

/** @public */
export type PriceOrRemainder = Decimal | null;

// eslint-disable-next-line @typescript-eslint/ban-types
/** @public */
export type JsonValue = string | number | boolean | null | Json | object | JsonValueArray;
// export type JsonValue = string | number | boolean | null | Json | JsonValueArray;
/** @public */
export interface Json {
    [name: string]: JsonValue;
}
/** @public */
export type JsonValueArray = Array<JsonValue>;
/** @public */
export namespace JsonValue {
    export function isJson(value: JsonValue): value is Json {
        return isJsonObject(value);
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    export function isJsonObject(value: JsonValue): value is Json | object {
        return !Array.isArray(value) && value !== null && typeof value === 'object';
    }
}

// MapKey is key type used for maps (content of objects cannot be used as keys in maps)
/** @public */
export type MapKey = string;
/** @public */
export interface Mappable {
    readonly mapKey: MapKey;
}

/** @public */
export type Handle = Integer;
/** @public */
export const invalidHandle = 0;
/** @public */
export type ExtensionHandle = Handle;

/** @public */
export const enum DayOfWeek {
    Sunday = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6,
}

/** @public */
export const enum ComparisonResult {
    LeftLessThanRight = -1,
    LeftEqualsRight = 0,
    LeftGreaterThanRight = 1,
}

/** @public */
export const enum ListChangeTypeId {
    Insert,
    Remove,
    Clear,
}

/** @public */
export const enum UsableListChangeTypeId {
    Unusable,
    PreUsableAdd,
    PreUsableClear,
    Usable,
    Insert,
    Remove,
    Clear,
}

/** @public */
export type SuccessOrErrorText = undefined | string;

/** @public */
export const SuccessOrErrorText_Success: SuccessOrErrorText = undefined;
/** @public */
export type ErrorSuccessOrErrorText = string;

/** @public */
export interface Rect {
    left: number;
    top: number;
    width: number;
    height: number;
}

/** @public */
export interface Line {
    beginX: number;
    beginY: number;
    endX: number;
    endY: number;
}

/** @public */
export interface RGB {
    r: number;
    g: number;
    b: number;
}

/** @public */
export type IndexSignatureHack<T> = { [K in keyof T]: IndexSignatureHack<T[K]> };
