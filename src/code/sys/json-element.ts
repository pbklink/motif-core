/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from 'decimal.js-light';
import { I18nStrings, StringId, Strings } from '../res/res-internal-api';
import { ErrorCode } from './error-code';
import { Logger } from './logger';
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
            this._json = JSON.parse(jsonText);
            return new Ok(undefined);
        } catch (e) {
            const errorText = JsonElement.generateErrorText('JsonElement.Parse', StringId.InvalidJsonText, jsonText);
            Logger.logError(errorText);
            if (!JsonElement.isJsonExceptionHandlable(e)) {
                throw e;
            } else {
                this.clear();
                return new Err(errorText);
            }
        }
    }

    hasName(name: string) {
        return name in this._json;
    }

    tryGetElementType(name: string): Result<JsonElement, string> {
        const objectValueResult = this.tryGetJsonObjectType(name);
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
    tryGetNativeObjectType(name: string): Result<object, string> {
        const jsonValue = this._json[name];
        if (JsonValue.isJson(jsonValue)) {
            return new Ok(jsonValue);
        } else {
            return new Err(typeof jsonValue);
        }
    }

    tryGetJsonObjectType(name: string): Result<Json, string> {
        const jsonValue = this._json[name];
        if (JsonValue.isJson(jsonValue)) {
            return new Ok(jsonValue);
        } else {
            return new Err(typeof jsonValue);
        }
    }

    tryGetStringType(name: string): Result<string, string> {
        const jsonValue = this._json[name];
        if (typeof jsonValue === 'string') {
            return new Ok(jsonValue);
        } else {
            return new Err(typeof jsonValue);
        }
    }

    getString(name: string, defaultValue: string) {
        const tryResult = this.tryGetStringType(name);
        if (tryResult.isOk()) {
            return tryResult.value;
        } else {
            return defaultValue;
        }
    }

    getStringOrUndefined(name: string, defaultValue: string) {
        const tryResult = this.tryGetStringType(name);
        if (tryResult.isOk()) {
            return tryResult.value;
        } else {
            return undefined;
        }
    }

    tryGetNumberType(name: string): Result<number, string> {
        const jsonValue = this._json[name];
        if (typeof jsonValue === 'number') {
            return new Ok(jsonValue);
        } else {
            return new Err(typeof jsonValue);
        }
    }

    getNumber(name: string, defaultValue: number) {
        const tryResult = this.tryGetNumberType(name);
        if (tryResult.isOk()) {
            return tryResult.value;
        } else {
            return defaultValue;
        }
    }

    getNumberOrUndefined(name: string, defaultValue: number) {
        const tryResult = this.tryGetNumberType(name);
        if (tryResult.isOk()) {
            return tryResult.value;
        } else {
            return undefined;
        }
    }

    tryGetBooleanType(name: string): Result<boolean, string> {
        const jsonValue = this._json[name];
        if (typeof jsonValue === 'boolean') {
            return new Ok(jsonValue);
        } else {
            return new Err(typeof jsonValue);
        }
    }

    getBoolean(name: string, defaultValue: boolean) {
        const tryResult = this.tryGetBooleanType(name);
        if (tryResult.isOk()) {
            return tryResult.value;
        } else {
            return defaultValue;
        }
    }

    getBooleanOrUndefined(name: string) {
        const tryResult = this.tryGetBooleanType(name);
        if (tryResult.isOk()) {
            return tryResult.value;
        } else {
            return undefined;
        }
    }

    tryGetElementArray(name: string): Result<JsonElement[], Integer> {
        const jsonValue = this._json[name];
        if (jsonValue === undefined) {
            return new Err(JsonElement.arrayErrorCode_NotSpecified);
        } else {
            if (!Array.isArray(jsonValue)) {
                return new Err(JsonElement.arrayErrorCode_NotAnArray);
            } else {
                const count = jsonValue.length;
                const resultArray = new Array<JsonElement>(count);
                for (let i = 0; i < count; i++) {
                    const elementJsonValue = jsonValue[i];
                    if (typeof elementJsonValue === 'object') {
                        resultArray[i] = new JsonElement(elementJsonValue);
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
                const count = jsonValue.length;
                const resultArray = new Array<Json>(count);
                for (let i = 0; i < count; i++) {
                    const elementJsonValue = jsonValue[i];
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
                const count = jsonValue.length;
                const resultArray = new Array<string>(count);
                for (let i = 0; i < count; i++) {
                    const elementJsonValue = jsonValue[i];
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
                const count = jsonValue.length;
                const resultArray = new Array<number>(count);
                for (let i = 0; i < count; i++) {
                    const elementJsonValue = jsonValue[i];
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
                const count = jsonValue.length;
                const resultArray = new Array<boolean>(count);
                for (let i = 0; i < count; i++) {
                    const elementJsonValue = jsonValue[i];
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

    tryGetAnyJsonValueTypeArray(name: string): Result<JsonValue[], Integer> {
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

    tryGetIntegerType(name: string): Result<Integer, string> {
        return this.tryGetNumberType(name);
    }

    getInteger(name: string, defaultValue: Integer) {
        const tryResult = this.tryGetIntegerType(name);
        return tryResult.isErr() ? defaultValue : tryResult.value;
    }

    getIntegerOrUndefined(name: string) {
        const tryResult = this.tryGetIntegerType(name);
        return tryResult.isErr() ? undefined : tryResult.value;
    }

    tryGetDateType(name: string): Result<Date, string> {
        const getStringResult = this.tryGetStringType(name);
        if (getStringResult.isErr()) {
            return new Err(getStringResult.error);
        } else {
            // value should have format YYYY-MM-DD
            const date = new Date(getStringResult.value);
            return new Ok(date);
        }
    }

    getDate(name: string, defaultValue: Date) {
        const tryResult = this.tryGetDateType(name);
        return tryResult.isErr() ? defaultValue : tryResult.value;
    }

    tryGetDateTimeType(name: string): Result<Date, string> {
        const getStringResult = this.tryGetStringType(name);
        if (getStringResult.isErr()) {
            return new Err(getStringResult.error);
        } else {
            // value should have ISO format
            const date = new Date(getStringResult.value);
            return new Ok(date);
        }
    }

    getDateTime(name: string, defaultValue: Date) {
        const tryResult = this.tryGetDateTimeType(name);
        return tryResult.isErr() ? defaultValue : tryResult.value;
    }

    tryGetGuidType(name: string): Result<Guid, string> {
        return this.tryGetStringType(name);
    }

    getGuid(name: string, defaultValue: Guid) {
        const tryResult = this.tryGetGuidType(name);
        return tryResult.isErr() ? defaultValue : tryResult.value;
    }

    tryGetDecimalType(name: string): Result<Decimal, string> {
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
        const tryResult = this.tryGetDecimalType(name);
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
                let valueAsJsonObject: Json | undefined;
                try {
                    valueAsJsonObject = value as Json;
                } catch (e) {
                    if (JsonElement.isJsonExceptionHandlable(e)) {
                        valueAsJsonObject = undefined;
                    } else {
                        throw e;
                    }
                }

                if (valueAsJsonObject !== undefined) {
                    callback(name, new JsonElement(valueAsJsonObject), index);
                }
            }
        });
    }

    forEachValue(callback: JsonElement.ForEachValueCallback) {
        Object.entries(this._json).forEach((nameValue: [string, JsonValue], index: number) => {
            const [name, value] = nameValue;
            if (typeof value === 'object') {
                let valueAsJsonObject: Json | undefined;
                try {
                    valueAsJsonObject = value as Json;
                } catch (e) {
                    if (JsonElement.isJsonExceptionHandlable(e)) {
                        valueAsJsonObject = undefined;
                    } else {
                        throw e;
                    }
                }

                if (valueAsJsonObject !== undefined) {
                    callback(name, valueAsJsonObject, index);
                }
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
        return parentElement.tryGetElementType(childName);
    }

    export function generateErrorText(functionName: string, stringId: StringId, jsonValue: unknown): string {
        let errorText = functionName + ': ' + I18nStrings.getStringPlusEnglish(stringId) + ': ';
        errorText += `${jsonValue}`.substring(0, 200); // make sure not too long
        return errorText;
    }

    export function generateGetErrorText(stringId: StringId, jsonValue: unknown): string {
        return generateErrorText('JsonElement.Get', stringId, jsonValue);
    }

    export function isJsonExceptionHandlable(e: unknown) {
        return typeof e === 'object' && (e instanceof TypeError || e instanceof SyntaxError);
    }
}
