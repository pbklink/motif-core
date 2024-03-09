/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { I18nStrings, StringId } from '../res/res-internal-api';
import { ErrorCode } from './error-code';
import { UnreachableCaseError } from './internal-error';
import { Err } from './result';
import { JsonElement } from './xiltyix-sysutils';

/** @public */
export class JsonElementErr<T = undefined> extends Err<T> {
    readonly errorId: JsonElement.ErrorId;

    constructor(errorId: JsonElement.ErrorId) {
        const errorCode = JsonElementErr.errorIdToCode(errorId);
        super(errorCode);
        this.errorId = errorId;
    }
}

/** @public */
export namespace JsonElementErr {
    export function create<T>(errorId: JsonElement.ErrorId): JsonElementErr<T> {
        return new JsonElementErr(errorId);
    }

    export function createOuter<OuterT = undefined>(errorId: JsonElement.ErrorId, outerErrorText: string): Err<OuterT> {
        const innerJsonElementErr = new JsonElementErr(errorId);
        return innerJsonElementErr.createOuter(outerErrorText);
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

    export function errorIdToCode(errorId: JsonElement.ErrorId): ErrorCode {
        switch (errorId) {
            case JsonElement.ErrorId.InvalidJsonText: return ErrorCode.JsonElement_InvalidJsonText;
            case JsonElement.ErrorId.ElementIsNotDefined: return ErrorCode.JsonElement_ElementIsNotDefined;
            case JsonElement.ErrorId.ElementIsNotAJsonObject: return ErrorCode.JsonElement_ElementIsNotAJsonObject;
            case JsonElement.ErrorId.JsonValueIsNotDefined: return ErrorCode.JsonElement_JsonValueIsNotDefined;
            case JsonElement.ErrorId.JsonValueIsNotOfTypeObject: return ErrorCode.JsonElement_JsonValueIsNotOfTypeObject;
            case JsonElement.ErrorId.JsonValueIsNotOfTypeString: return ErrorCode.JsonElement_JsonValueIsNotOfTypeString;
            case JsonElement.ErrorId.JsonValueIsNotOfTypeNumber: return ErrorCode.JsonElement_JsonValueIsNotOfTypeNumber;
            case JsonElement.ErrorId.JsonValueIsNotOfTypeBoolean: return ErrorCode.JsonElement_JsonValueIsNotOfTypeBoolean;
            case JsonElement.ErrorId.DecimalJsonValueIsNotOfTypeString: return ErrorCode.JsonElement_DecimalJsonValueIsNotOfTypeString;
            case JsonElement.ErrorId.InvalidDecimal: return ErrorCode.JsonElement_InvalidDecimal;
            case JsonElement.ErrorId.JsonValueIsNotAnArray: return ErrorCode.JsonElement_JsonValueIsNotAnArray;
            case JsonElement.ErrorId.JsonValueArrayElementIsNotAnObject: return ErrorCode.JsonElement_JsonValueArrayElementIsNotAnObject;
            case JsonElement.ErrorId.JsonValueArrayElementIsNotJson: return ErrorCode.JsonElement_JsonValueArrayElementIsNotJson;
            case JsonElement.ErrorId.JsonValueArrayElementIsNotAString: return ErrorCode.JsonElement_JsonValueArrayElementIsNotAString;
            case JsonElement.ErrorId.JsonValueArrayElementIsNotANumber: return ErrorCode.JsonElement_JsonValueArrayElementIsNotANumber;
            case JsonElement.ErrorId.JsonValueArrayElementIsNotABoolean: return ErrorCode.JsonElement_JsonValueArrayElementIsNotABoolean;
            default:
                throw new UnreachableCaseError('JEEEITS10911', errorId);
        }
    }
}
