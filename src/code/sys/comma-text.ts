/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode } from './error-code';
import { Err, Ok, Result } from './error-code-with-extra-err';
import { StringBuilder } from './string-builder';
import { UnreachableCaseError } from './xiltyix-sysutils';

/** @public */
export namespace CommaText {
    const enum InQuotes { NotIn, In, CheckingStuffed }

    export const delimiterChar = ',';
    export const quoteChar = '"';
    export const pairQuoteChar = quoteChar + quoteChar;
    const quoteCharGlobalRegEx = /"/g;
    const pairQuoteCharGlobalRegEx = /""/g;

    export function from2Values(value1: string, value2: string): string {
        const array: string[] = new Array<string>(2);
        array[0] = value1;
        array[1] = value2;
        return fromStringArray(array);
    }

    export function from3Values(value1: string, value2: string, value3: string): string {
        const array: string[] = new Array<string>(3);
        array[0] = value1;
        array[1] = value2;
        array[2] = value3;
        return fromStringArray(array);
    }

    export function from4Values(value1: string, value2: string, value3: string, value4: string): string {
        const array: string[] = new Array<string>(4);
        array[0] = value1;
        array[1] = value2;
        array[2] = value3;
        array[3] = value4;
        return fromStringArray(array);
    }

    export function fromStringArray(value: readonly string[]): string {

        function appendQuotedString(unquotedValue: string) {
            resultBldr.append(quoteChar);
            const quoteStuffedValue = unquotedValue.replace(quoteCharGlobalRegEx, pairQuoteChar);
            resultBldr.append(quoteStuffedValue);
            resultBldr.append(quoteChar);
        }

        const resultBldr = new StringBuilder();

        for (let i = 0; i < value.length; i++) {
            if (i > 0) {
                resultBldr.append(delimiterChar);
            }

            const element = value[i];

            if (element.includes(delimiterChar)) {
                appendQuotedString(element);
            } else {
                const trimmedValue = element.trim();
                // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
                if (trimmedValue.length > 0 && trimmedValue[0] === quoteChar) {
                    appendQuotedString(element);
                } else {
                    resultBldr.append(element);
                }
            }
        }

        return resultBldr.toString();
    }

    export function fromIntegerArray(value: number[]): string {
        const strArray = new Array<string>(value.length);
        for (let i = 0; i < value.length; i++) {
            strArray[i] = value[i].toString(10);
        }
        return fromStringArray(strArray);
    }

    export function toStringArray(value: string): string[] {
        const toResult = tryToStringArray(value, false);
        if (toResult.isOk()) {
            return toResult.value;
        } else {
            throw new Error(`ToStringArray: Error: "${toResult.error}" Value: ${value}`);
        }
    }

    export function tryToStringArray(value: string, strict = true): Result<string[]> {
        function addElement(endPos: number, removeStuffedQuotes: boolean) {
            let elemStr = value.substring(startPos, endPos + 1);
            if (removeStuffedQuotes) {
                elemStr = elemStr.replace(pairQuoteCharGlobalRegEx, quoteChar);
            }
            resultArray.push(elemStr.trim());
        }

        const resultArray: string[] = [];
        let inQuotes = InQuotes.NotIn;
        let waitingForDelimiter = false;
        let startPos = 0;
        const valueLength = value.length;

        for (let I = 0; I < valueLength; I++) {
            const valueChar = value[I];
            if (waitingForDelimiter) {
                if (valueChar === delimiterChar) {
                    waitingForDelimiter = false;
                    startPos = I + 1;
                } else {
                    if (strict && !/\s/.test(valueChar)) {
                        return new Err(`${ErrorCode.CommaText_UnexpectedCharAfterQuotedElement}: ${I}`);
                    }
                }
            } else {
                switch (inQuotes) {
                    case InQuotes.NotIn:
                        switch (valueChar) {
                            case delimiterChar:
                                addElement(I - 1, false);
                                startPos = I + 1;
                                break;
                            case quoteChar:
                                if ((value.substring(startPos, I).trim).length === 0) {
                                    inQuotes = InQuotes.In;
                                    startPos = I + 1;
                                }
                                break;
                        }
                        break;
                    case InQuotes.In:
                        if (valueChar === quoteChar) {
                            inQuotes = InQuotes.CheckingStuffed;
                        }
                        break;
                    case InQuotes.CheckingStuffed:
                        switch (valueChar) {
                            case quoteChar:
                                inQuotes = InQuotes.In;
                                break;
                            case delimiterChar:
                                inQuotes = InQuotes.NotIn;
                                addElement(I - 2, true);
                                startPos = I + 1;
                                break;
                            default:
                                inQuotes = InQuotes.NotIn;
                                addElement(I - 2, true);
                                waitingForDelimiter = true;

                                if (strict && !/\s/g.test(valueChar)) {
                                    return new Err(`${ErrorCode.CommaText_UnexpectedCharAfterQuotedElement}: ${I}`);
                                }
                        }
                        break;
                    default:
                        throw new UnreachableCaseError('CTTTSA66699', inQuotes);
                }
            }
        }

        if (!waitingForDelimiter) {
            switch (inQuotes) {
                case InQuotes.NotIn:
                    if (startPos <= valueLength) {
                        addElement(valueLength, false);
                    }
                    break;
                case InQuotes.In:
                    if (!strict) {
                        addElement(valueLength, true);
                    } else {
                        return new Err(`${ErrorCode.CommaText_QuotesNotClosedInLastElement}: ${value}`);
                    }
                    break;
                case InQuotes.CheckingStuffed:
                    addElement(valueLength - 2, true);
                    break;
                default:
                    throw new UnreachableCaseError('CTTSAWR24240', inQuotes);
            }
        }

        return new Ok(resultArray);
    }

    export interface ToIntegerArrayResult {
        success: boolean;
        array: number[];
        errorText: string;
    }

    export function toIntegerArrayWithResult(value: string): Result<number[]> {
        const strResult = tryToStringArray(value, true);
        if (strResult.isErr()) {
            return strResult.createOuter(ErrorCode.CommaText_IntegerParseStringArray);
        } else {
            const strArray = strResult.value;
            const intResult = new Array<number>(strArray.length);
            for (let i = 0; i < strArray.length; i++) {
                intResult[i] = +strArray[i];
                if (isNaN(intResult[i])) {
                    return new Err(`${ErrorCode.CommaText_InvalidIntegerString}: ${i}, ${strArray[i]}`)
                }
            }

            return new Ok(intResult);
        }
    }

    export interface StrictValidateResult {
        success: boolean;
        errorText: string;
    }

    export function strictValidate(value: string): Result<boolean> {
        const stringResult = tryToStringArray(value, true);
        if (stringResult.isErr()) {
            return stringResult.createOuter(stringResult.error);
        } else {
            return new Ok(true);
        }
    }
}
