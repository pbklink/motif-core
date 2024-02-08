/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode } from './error-code';

/** @public */
export type Result<T, E = string> = Ok<T, E> | Err<T, E>;

/** @public */
export class Ok<T, E> {
    constructor(public readonly value: T) {}

    public isOk(): this is Ok<T, E> {
        return true;
    }

    public isErr(): this is Err<T, E> {
        return false;
    }
}

export namespace Ok {
    export function createResolvedPromise<T, E>(value: T) {
        const ok = new Ok<T, E>(value);
        return Promise.resolve(ok);
    }
}

/** @public */
export class Err<T = undefined, E = string> {
    constructor(public readonly error: E) {}

    public isOk(): this is Ok<T, E> {
        return false;
    }

    public isErr(): this is Err<T, E> {
        return true;
    }

    createOuter<OuterT = undefined>(outerError: string) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        return new Err<OuterT>(outerError + ': ' + `${this.error}`);
    }

    createType<NewT>() {
        return new Err<NewT, E>(this.error);
    }

    createOuterResolvedPromise<OuterT = undefined>(outerError: string) {
        const err = this.createOuter<OuterT>(outerError);
        return Promise.resolve(err);
    }
}

export namespace Err {
    export function createResolvedPromise<T = undefined, E = string>(error: E) {
        const err = new Err<T, E>(error);
        return Promise.resolve(err);
    }
}

/** @public */
export class ErrorCodeErr<T = undefined> extends Err<T, ErrorCode> {
}

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
