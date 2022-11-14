/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { I18nStrings, StringId } from '../res/res-internal-api';
import { Logger } from './logger';
import { ThrowableError } from './throwable-result';

/** @public */
export abstract class BaseInternalError extends ThrowableError {
    constructor(errorTypeDescription: StringId, readonly code: string, message?: string) {
        super(message === undefined || message === '' ?
            I18nStrings.getStringPlusEnglish(errorTypeDescription) + `: ${code}`
            :
            I18nStrings.getStringPlusEnglish(errorTypeDescription) + `: ${code}: ${message}`);
        Logger.logError(this.message, 120);
    }
}

/** @public */
export class InternalError extends BaseInternalError {
    constructor(code: string, message: string) {
        super(StringId.InternalError, code, message);
    }
}

/** @public */
export class AssertInternalError extends BaseInternalError {
    constructor(code: string, message?: string) {
        super(StringId.AssertInternalError, code, message);
    }
}

/** @public */
export class NotImplementedError extends BaseInternalError {
    constructor(code: string) {
        super(StringId.NotImplementedInternalError, code);
    }
}

/** @public */
export class UnexpectedUndefinedError extends BaseInternalError {
    constructor(code: string, message?: string) {
        super(StringId.UnexpectedUndefinedInternalError, code, message);
    }
}

/** @public */
export class UnexpectedTypeError extends BaseInternalError {
    constructor(code: string, message: string) {
        super(StringId.UnexpectedTypeInternalError, code, message);
    }
}

/** @public */
export class UnreachableCaseError extends BaseInternalError {
    constructor(code: string, value: never) {
        super(StringId.UnreachableCaseInternalError, code, `"${value}"`);
    }
}

/** @public */
export class UnexpectedCaseError extends BaseInternalError {
    constructor(code: string, message?: string) {
        super(StringId.UnreachableCaseInternalError, code, message);
    }
}

/** @public */
export class EnumInfoOutOfOrderError extends BaseInternalError {
    constructor(enumName: string, outOfOrderInfoElementIndex: number, infoDescription: string) {
        super(StringId.EnumInfoOutOfOrderInternalError, enumName,  `${outOfOrderInfoElementIndex}: ${infoDescription.substr(0, 100)}`);
    }
}
