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
export namespace AssertInternalError {
    export const enum ExtraFormatting {
        Ignore,
        PrependWithColonSpace,
        PrependWithColonSpaceQuoteError,
        Postpend,
        PostpendColonSpace,
        PostpendColonSpaceQuoted,
    }

    export function createIfNotError(
        e: unknown,
        code: string,
        extraMessage?: string,
        extraFormatting?: AssertInternalError.ExtraFormatting
    ): Error {
        if (e instanceof Error) {
            let message: string;
            if (extraMessage === undefined) {
                message = `${code}: ${e.message}`;
            } else {
                if (extraFormatting === undefined) {
                    extraFormatting = ExtraFormatting.PostpendColonSpaceQuoted;
                }
                const formattedMessage = formatExtra(e.message, extraMessage, extraFormatting);
                if (formattedMessage.length === 0) {
                    message = code;
                } else {
                    message = `${code}: ${formattedMessage}`;
                }
            }
            e.message = message;
            return e;
        } else {
            if (typeof e === 'string' && extraFormatting !== undefined) {
                if (extraMessage === undefined) {
                    extraMessage = code;
                }
                const message = formatExtra(e, extraMessage, extraFormatting);
                return new AssertInternalError(code, message);
            } else {
                return new AssertInternalError(code, extraMessage);
            }
        }
    }

    export function throwErrorIfVoidPromiseRejected(
        promise: Promise<void>,
        code: string,
        extraMessage?: string,
        extraFormatting?: AssertInternalError.ExtraFormatting
    ): void {
        promise.then(
            () => {/**/},
            (reason) => { throw AssertInternalError.createIfNotError(reason, code, extraMessage, extraFormatting); }
        );
    }

    function formatExtra(existingMessage: string, extraMessage: string, extraFormatting: ExtraFormatting) {
        switch (extraFormatting) {
            case ExtraFormatting.Ignore: return existingMessage;
            case ExtraFormatting.PrependWithColonSpace: return `${extraMessage}: ${existingMessage}`;
            case ExtraFormatting.PrependWithColonSpaceQuoteError: return `${extraMessage}: "${existingMessage}"`;
            case ExtraFormatting.Postpend: return `${existingMessage}${extraMessage}`;
            case ExtraFormatting.PostpendColonSpace: return `${existingMessage}: ${extraMessage}`;
            case ExtraFormatting.PostpendColonSpaceQuoted: return `${existingMessage}: "${extraMessage}"`;
            default:
                throw new UnreachableCaseError('IEAIECINE87339', extraFormatting);
        }
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
    constructor(code: string, value: never, errorText?: string) {
        if (errorText === undefined) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            errorText = `"${value}"`;
        }
        super(StringId.UnreachableCaseInternalError, code, errorText);
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
