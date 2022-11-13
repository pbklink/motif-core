/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExternalError } from './external-error';
import { InternalError } from './internal-error';

/** @public */
export type Result<T, E extends (string | InternalError | ExternalError)> = Ok<T, E> | Err<T, E>;

/** @public */
export class Ok<T, E extends (string | InternalError | ExternalError)> {
    public constructor(public readonly value: T) {}

    public isOk(): this is Ok<T, E> {
        return true;
    }

    public isErr(): this is Err<T, E> {
        return false;
    }
}

/** @public */
export class Err<T, E extends (string | InternalError | ExternalError)> {
    public constructor(public readonly error: E) {}

    public isOk(): this is Ok<T, E> {
        return false;
    }

    public isErr(): this is Err<T, E> {
        return true;
    }

    createExtended<XT>(error: string | InternalError | ExternalError): Err<XT, string | InternalError | ExternalError> {
        const thisError = this.error;
        if (typeof error === 'string') {
            let extendedError: string;
            if (typeof thisError === 'string') {
                extendedError = error + ': ' + thisError;
            } else {
                extendedError = error + ': ' + thisError.message;
            }
            return new Err(extendedError);
        } else {
            let extendedMsg: string = error.message;
            if (typeof thisError === 'string') {
                extendedMsg = error.message + ': ' + thisError;
            } else {
                extendedMsg = error.message + ': ' + thisError.message;
            }
            error.message = extendedMsg;
            return new Err(error);
        }
    }
}
