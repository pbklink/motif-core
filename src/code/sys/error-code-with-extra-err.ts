/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode } from './error-code';
import { Err } from './xilytix-sysutils';
export { Err, Ok, Result } from './xilytix-sysutils';

export interface ErrorCodeWithExtra {
    code: ErrorCode;
    extra: string;
}

/** @public */
export class ErrorCodeWithExtraErr<T = undefined> extends Err<T, ErrorCodeWithExtra>{
    createErrorCodeWithExtraOuter<OuterT = undefined>(outerExtra: string) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        return new ErrorCodeWithExtraErr<OuterT>({ code: this.error.code, extra: outerExtra + ': ' + this.error.extra });
    }

    createErrorCodeWithExtraType<NewT>() {
        return new ErrorCodeWithExtraErr<NewT>(this.error);
    }

    createErrorCodeWithExtraOuterResolvedPromise<OuterT = undefined>(outerExtra: string) {
        const err = this.createErrorCodeWithExtraOuter<OuterT>(outerExtra);
        return Promise.resolve(err);
    }
}

export namespace ErrorCodeWithExtraErr {
    export function createResolvedPromise<T = undefined, E = ErrorCodeWithExtra>(error: E) {
        const err = new Err<T, E>(error);
        return Promise.resolve(err);
    }
}
