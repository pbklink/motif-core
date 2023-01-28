/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from 'decimal.js-light';
import { I18nStrings, StringId, Strings } from '../res/res-internal-api';
import { ErrorCode } from './error-code';
import { Err, Ok, Result } from './result';
import { Guid, Integer, Json, JsonValue } from './types';
import { dateToDateOnlyIsoString, deepExtendObject } from './utils';

/** @public */
export class JsonElement {
    private _json: Json;

    constructor(jsonObject?: Json) {
        this._json = jsonObject ?? {};
    }

    get json() { return this._json; }

    getState(): Json {
        return this._json;
    }

    clear() {
        this._json = {};
    }

    shallowAssign(element: JsonElement | undefined) {
        if (element === undefined) {
            this._json = {};
        } else {
            const json = element.json;
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (json === undefined) {
                this._json = {};
            } else {
                this._json = element.json;
            }
        }
    }

    deepExtend(other: Json) {
        deepExtendObject(this._json, other);
    }

    stringify(): string {
        return JSON.stringify(this._json);
    }

    parse(jsonText: string): Result<void> {
        try {
            this._json = JSON.parse(jsonText) as Json;
            return new Ok(undefined);
        } catch (e) {
            const errorText = JsonElement.generateErrorText('JsonElement.Parse', StringId.InvalidJsonText, jsonText);
            this.clear();
            return new Err(errorText);
        }
    }

    hasName(name: string) {
        return name in this._json;
    }

    tryGetElement(name: string): Result<JsonElement> {
        const objectValueResult = this.tryGetJsonObject(name);
        if (objectValueResult.isErr()) {
            return objectValueResult.createOuter(ErrorCode.JsonElement_TryGetElement);
        } else {
            const element = new JsonElement(objectValueResult.value);
            return new Ok(element);
        }
    }

    tryGetJsonValue(name: string) {
        return this._json[name];
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    tryGetNativeObject(name: string): Result<object> {
        const jsonValue = this._json[name];
        if (JsonValue.isJson(jsonValue)) {
            return new Ok(jsonValue);
        } else {
            return new Err(typeof jsonValue);
        }
    }

    tryGetJsonObject(name: string): Result<Json> {
        const jsonValue = this._json[name];
        if (JsonValue.isJson(jsonValue)) {
            return new Ok(jsonValue);
        } else {
            return new Err(typeof jsonValue);
        }
    }

    tryGetString(name: string): Result<string> {
        const jsonValue = this._json[name];
        if (typeof jsonValue === 'string') {
            return new Ok(jsonValue);
        } else {
            return new Err(typeof jsonValue);
        }
    }

    getString(name: string, defaultValue: string) {
        const tryResult = this.tryGetString(name);
        if (tryResult.isOk()) {
            return tryResult.value;
        } else {
            return defaultValue;
        }
    }

    getStringOrUndefined(name: string, defaultValue: string) {
        const tryResult = this.tryGetString(name);
        if (tryResult.isOk()) {
            return tryResult.value;
        } else {
            return undefined;
        }
    }

    tryGetNumber(name: string): Result<number> {
        const jsonValue = this._json[name];
        if (typeof jsonValue === 'number') {
            return new Ok(jsonValue);
        } else {
            return new Err(typeof jsonValue);
        }
    }

    getNumber(name: string, defaultValue: number) {
        const tryResult = this.tryGetNumber(name);
        if (tryResult.isOk()) {
            return tryResult.value;
        } else {
            return defaultValue;
        }
    }

    getNumberOrUndefined(name: string, defaultValue: number) {
        const tryResult = this.tryGetNumber(name);
        if (tryResult.isOk()) {
            return tryResult.value;
        } else {
            return undefined;
        }
    }

    tryGetBoolean(name: string): Result<boolean> {
        const jsonValue = this._json[name];
        if (typeof jsonValue === 'boolean') {
            return new Ok(jsonValue);
        } else {
            return new Err(typeof jsonValue);
        }
    }

    getBoolean(name: string, defaultValue: boolean) {
        const tryResult = this.tryGetBoolean(name);
        if (tryResult.isOk()) {
            return tryResult.value;
        } else {
            return defaultValue;
        }
    }

    getBooleanOrUndefined(name: string) {
        const tryResult = this.tryGetBoolean(name);
        if (tryResult.isOk()) {
            return tryResult.value;
        } else {
            return undefined;
        }
    }

    tryGetElementArray(name: string): Result<JsonElement[], Integer> {
        const jsonValue = this._json[name];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (jsonValue === undefined) {
            return new Err(JsonElement.arrayErrorCode_NotSpecified);
        } else {
            if (!Array.isArray(jsonValue)) {
                return new Err(JsonElement.arrayErrorCode_NotAnArray);
            } else {
                const jsonValueArray = jsonValue as JsonValue[];
                const count = jsonValueArray.length;
                const resultArray = new Array<JsonElement>(count);
                for (let i = 0; i < count; i++) {
                    const elementJsonValue = jsonValueArray[i];
                    if (typeof elementJsonValue === 'object') {
                        resultArray[i] = new JsonElement(elementJsonValue as Json);
                    } else {
                        return new Err(i);
                    }
                }

                return new Ok(resultArray);
            }
        }
    }

    tryGetJsonObjectArray(name: string): Result<Json[], Integer> {
        const jsonValue = this._json[name];
        if (jsonValue === undefined) {
            return new Err(JsonElement.arrayErrorCode_NotSpecified);
        } else {
            if (!Array.isArray(jsonValue)) {
                return new Err(JsonElement.arrayErrorCode_NotAnArray);
            } else {
                const jsonValueArray = jsonValue as JsonValue[];
                const count = jsonValueArray.length;
                const resultArray = new Array<Json>(count);
                for (let i = 0; i < count; i++) {
                    const elementJsonValue = jsonValueArray[i];
                    if (JsonValue.isJson(elementJsonValue)) {
                        resultArray[i] = elementJsonValue;
                    } else {
                        return new Err(i);
                    }
                }

                return new Ok(resultArray);
            }
        }
    }

    tryGetStringArray(name: string): Result<string[], Integer> {
        const jsonValue = this._json[name];
        if (jsonValue === undefined) {
            return new Err(JsonElement.arrayErrorCode_NotSpecified);
        } else {
            if (!Array.isArray(jsonValue)) {
                return new Err(JsonElement.arrayErrorCode_NotAnArray);
            } else {
                const jsonValueArray = jsonValue as JsonValue[];
                const count = jsonValueArray.length;
                const resultArray = new Array<string>(count);
                for (let i = 0; i < count; i++) {
                    const elementJsonValue = jsonValueArray[i];
                    if (typeof elementJsonValue === 'string') {
                        resultArray[i] = elementJsonValue;
                    } else {
                        return new Err(i);
                    }
                }

                return new Ok(resultArray);
            }
        }
    }

    tryGetNumberArray(name: string): Result<number[], Integer> {
        const jsonValue = this._json[name];
        if (jsonValue === undefined) {
            return new Err(JsonElement.arrayErrorCode_NotSpecified);
        } else {
            if (!Array.isArray(jsonValue)) {
                return new Err(JsonElement.arrayErrorCode_NotAnArray);
            } else {
                const jsonValueArray = jsonValue as JsonValue[];
                const count = jsonValueArray.length;
                const resultArray = new Array<number>(count);
                for (let i = 0; i < count; i++) {
                    const elementJsonValue = jsonValueArray[i];
                    if (typeof elementJsonValue === 'number') {
                        resultArray[i] = elementJsonValue;
                    } else {
                        return new Err(i);
                    }
                }

                return new Ok(resultArray);
            }
        }
    }

    tryGetBooleanArray(name: string): Result<boolean[], Integer> {
        const jsonValue = this._json[name];
        if (jsonValue === undefined) {
            return new Err(JsonElement.arrayErrorCode_NotSpecified);
        } else {
            if (!Array.isArray(jsonValue)) {
                return new Err(JsonElement.arrayErrorCode_NotAnArray);
            } else {
                const jsonValueArray = jsonValue as JsonValue[];
                const count = jsonValueArray.length;
                const resultArray = new Array<boolean>(count);
                for (let i = 0; i < count; i++) {
                    const elementJsonValue = jsonValueArray[i];
                    if (typeof elementJsonValue === 'boolean') {
                        resultArray[i] = elementJsonValue;
                    } else {
                        return new Err(i);
                    }
                }

                return new Ok(resultArray);
            }
        }
    }

    tryGetAnyJsonValueArray(name: string): Result<JsonValue[], Integer> {
        const jsonValue = this._json[name];
        if (jsonValue === undefined) {
            return new Err(JsonElement.arrayErrorCode_NotSpecified);
        } else {
            if (!Array.isArray(jsonValue)) {
                return new Err(JsonElement.arrayErrorCode_NotAnArray);
            } else {
                return new Ok(jsonValue);
            }
        }
    }

    tryGetInteger(name: string): Result<Integer> {
        return this.tryGetNumber(name);
    }

    getInteger(name: string, defaultValue: Integer) {
        const tryResult = this.tryGetInteger(name);
        return tryResult.isErr() ? defaultValue : tryResult.value;
    }

    getIntegerOrUndefined(name: string) {
        const tryResult = this.tryGetInteger(name);
        return tryResult.isErr() ? undefined : tryResult.value;
    }

    tryGetDate(name: string): Result<Date> {
        const getStringResult = this.tryGetString(name);
        if (getStringResult.isErr()) {
            return new Err(getStringResult.error);
        } else {
            // value should have format YYYY-MM-DD
            const date = new Date(getStringResult.value);
            return new Ok(date);
        }
    }

    getDate(name: string, defaultValue: Date) {
        const tryResult = this.tryGetDate(name);
        return tryResult.isErr() ? defaultValue : tryResult.value;
    }

    tryGetDateTime(name: string): Result<Date> {
        const getStringResult = this.tryGetString(name);
        if (getStringResult.isErr()) {
            return new Err(getStringResult.error);
        } else {
            // value should have ISO format
            const date = new Date(getStringResult.value);
            return new Ok(date);
        }
    }

    getDateTime(name: string, defaultValue: Date) {
        const tryResult = this.tryGetDateTime(name);
        return tryResult.isErr() ? defaultValue : tryResult.value;
    }

    tryGetGuid(name: string): Result<Guid> {
        return this.tryGetString(name);
    }

    getGuid(name: string, defaultValue: Guid) {
        const tryResult = this.tryGetGuid(name);
        return tryResult.isErr() ? defaultValue : tryResult.value;
    }

    tryGetDecimal(name: string): Result<Decimal> {
        const jsonValue = this._json[name];
        if (typeof jsonValue === 'string') {
            try {
                const value = new Decimal(jsonValue);
                return new Ok(value);
            } catch (e) {
                if (e instanceof Error) {
                    return new Err(e.message);
                } else {
                    if (typeof e === 'string') {
                        return new Err(e);
                    } else {
                        return new Err(Strings[StringId.InvalidDecimal]);
                    }
                }
            }
        } else {
            return new Err(typeof jsonValue);
        }
    }

    getDecimal(name: string, defaultValue: Decimal) {
        const tryResult = this.tryGetDecimal(name);
        return tryResult.isErr() ? defaultValue : tryResult.value;
    }

    newElement(name: string): JsonElement {
        const result = new JsonElement();
        this._json[name] = result._json;
        return result;
    }

    setElement(name: string, value: JsonElement | undefined) {
        if (value !== undefined) {
            this._json[name] = value._json;
        }
    }

    setJson(name: string, value: Json | undefined) {
        if (value !== undefined) {
            this._json[name] = value;
        }
    }

    setJsonValue(name: string, value: JsonValue | undefined) {
        if (value !== undefined) {
            this._json[name] = value;
        }
    }

    setString(name: string, value: string | undefined) {
        if (value !== undefined) {
            this._json[name] = value;
        }
    }

    setNumber(name: string, value: number | undefined) {
        if (value !== undefined) {
            this._json[name] = value;
        }
    }

    setBoolean(name: string, value: boolean | undefined) {
        if (value !== undefined) {
            this._json[name] = value;
        }
    }

    setElementArray(name: string, value: JsonElement[] | undefined) {
        if (value !== undefined && value.length > 0) {
            const valueObjArray = new Array<Json>(value.length);
            for (let i = 0; i < value.length; i++) {
                valueObjArray[i] = value[i]._json;
            }
            this._json[name] = valueObjArray;
        }
    }

    setObjectArray(name: string, value: Json[] | undefined) {
        if (value !== undefined) {
            this._json[name] = value;
        }
    }

    setStringArray(name: string, value: string[] | undefined) {
        if (value !== undefined) {
            this._json[name] = value;
        }
    }

    setNumberArray(name: string, value: number[] | undefined) {
        if (value !== undefined) {
            this._json[name] = value;
        }
    }

    setBooleanArray(name: string, value: boolean[] | undefined) {
        if (value !== undefined) {
            this._json[name] = value;
        }
    }

    setInteger(name: string, value: Integer | undefined) {
        if (value !== undefined) {
            this.setNumber(name, value);
        }
    }

    setDate(name: string, value: Date | undefined) {
        if (value !== undefined) {
            const jsonValue = dateToDateOnlyIsoString(value);
            this.setString(name, jsonValue);
        }
    }

    setDateTime(name: string, value: Date | undefined) {
        if (value !== undefined) {
            this.setString(name, value.toISOString());
        }
    }

    setGuid(name: string, value: Guid | undefined) {
        if (value !== undefined) {
            this.setString(name, value);
        }
    }

    setDecimal(name: string, value: Decimal | undefined) {
        if (value !== undefined) {
            this._json[name] = value.toJSON();
        }
    }

    forEach(callback: JsonElement.ForEachCallback) {
        Object.entries(this._json).forEach((nameValue: [string, JsonValue], index: number) => {
            const [name, value] = nameValue;
            callback(name, value, index);
        });
    }

    forEachElement(callback: JsonElement.ForEachElementCallback) {
        Object.entries(this._json).forEach((nameValue: [string, JsonValue], index: number) => {
            const [name, value] = nameValue;
            if (typeof value === 'object') {
                const valueAsJsonObject = value as Json;
                callback(name, new JsonElement(valueAsJsonObject), index);
            }
        });
    }

    forEachValue(callback: JsonElement.ForEachValueCallback) {
        Object.entries(this._json).forEach((nameValue: [string, JsonValue], index: number) => {
            const [name, value] = nameValue;
            if (typeof value === 'object') {
                const valueAsJsonObject = value as Json;
                callback(name, valueAsJsonObject, index);
            }
        });
    }

    forEachString(callback: JsonElement.ForEachStringCallback) {
        Object.entries(this._json).forEach((nameValue: [string, JsonValue], index: number) => {
            const [name, value] = nameValue;
            if (typeof value === 'string') {
                callback(name, value, index);
            }
        });
    }

    forEachNumber(callback: JsonElement.ForEachNumberCallback) {
        Object.entries(this._json).forEach((nameValue: [string, JsonValue], index: number) => {
            const [name, value] = nameValue;
            if (typeof value === 'number') {
                callback(name, value, index);
            }
        });
    }

    forEachBoolean(callback: JsonElement.ForEachBooleanCallback) {
        Object.entries(this._json).forEach((nameValue: [string, JsonValue], index: number) => {
            const [name, value] = nameValue;
            if (typeof value === 'boolean') {
                callback(name, value, index);
            }
        });
    }
}

/** @public */
export namespace JsonElement {
    export type ForEachCallback = (this: void, name: string, value: JsonValue, idx: Integer) => void;
    export type ForEachElementCallback = (this: void, name: string, value: JsonElement, idx: Integer) => void;
    export type ForEachValueCallback = (this: void, name: string, value: JsonValue, idx: Integer) => void;
    export type ForEachStringCallback = (this: void, name: string, value: string, idx: Integer) => void;
    export type ForEachNumberCallback = (this: void, name: string, value: number, idx: Integer) => void;
    export type ForEachBooleanCallback = (this: void, name: string, value: boolean, idx: Integer) => void;

    export const arrayErrorCode_NotSpecified = -1;
    export const arrayErrorCode_NotAnArray = -2;

    export function isUndefinedError(resultError: string) {
        return resultError === 'undefined';
    }

    export function createRootElement(rootJson: Json) {
        return new JsonElement(rootJson);
    }

    export function tryGetChildElement(parentElement: JsonElement, childName: string) {
        return parentElement.tryGetElement(childName);
    }

    export function generateErrorText(functionName: string, stringId: StringId, jsonValue: unknown): string {
        let errorText = functionName + ': ' + I18nStrings.getStringPlusEnglish(stringId) + ': ';
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        errorText += `${jsonValue}`.substring(0, 200); // make sure not too long
        return errorText;
    }

    export function generateGetErrorText(stringId: StringId, jsonValue: unknown): string {
        return generateErrorText('JsonElement.Get', stringId, jsonValue);
    }
}
