/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

/** @public */
export type ThrowableResult<T> = ThrowableOk<T> | ThrowableError;

/** @public */
export class ThrowableOk<T> {
    public constructor(public readonly value: T) {}

    public isOk(): this is ThrowableOk<T> {
        return true;
    }

    public isErr(): this is ThrowableError {
        return false;
    }
}

/** @public */
export class ThrowableError extends Error {
    constructor(message: string) {
        super(message);
    }

    public isOk(): this is ThrowableOk<string> {
        return false;
    }

    public isErr(): this is ThrowableError {
        return true;
    }

    // createExtended<XT>(error: string | InternalError | ExternalError): Err<XT, string | InternalError | ExternalError> {
    //     const thisError = this.error;
    //     if (typeof error === 'string') {
    //         let extendedError: string;
    //         if (typeof thisError === 'string') {
    //             extendedError = error + ': ' + thisError;
    //         } else {
    //             extendedError = error + ': ' + thisError.message;
    //         }
    //         return new Err(extendedError);
    //     } else {
    //         let extendedMsg: string = error.message;
    //         if (typeof thisError === 'string') {
    //             extendedMsg = error.message + ': ' + thisError;
    //         } else {
    //             extendedMsg = error.message + ': ' + thisError.message;
    //         }
    //         error.message = extendedMsg;
    //         return new Err(error);
    //     }
    // }
}

/** @public */
export namespace ThrowableError {
    export function appendToErrorMessage(e: unknown, appendText: string) {
        if (e instanceof Error) {
            e.message += appendText;
            return e;
        } else {
            if (typeof e === 'string') {
                e += appendText;
                return e;
            } else {
                return e; // Do not know how to append
            }
        }
    }

    export function prependErrorMessage(e: unknown, prependText: string) {
        if (e instanceof Error) {
            e.message = prependText + e.message;
            return e;
        } else {
            if (typeof e === 'string') {
                e = prependText + e;
                return e;
            } else {
                return e; // Do not know how to prepend
            }
        }
    }
}
