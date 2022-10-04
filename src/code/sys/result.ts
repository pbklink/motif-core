import { ExternalError } from './external-error';
import { InternalError } from './internal-error';

/** @public */
export type Result<T, E extends (InternalError | ExternalError)> = Ok<T, E> | Err<T, E>;

/** @public */
export class Ok<T, E extends (InternalError | ExternalError)> {
    public constructor(public readonly value: T) {}

    public isOk(): this is Ok<T, E> {
        return true;
    }

    public isErr(): this is Err<T, E> {
        return false;
    }
}

/** @public */
export class Err<T, E extends (InternalError | ExternalError)> {
    public constructor(public readonly error: E) {}

    public isOk(): this is Ok<T, E> {
        return false;
    }

    public isErr(): this is Err<T, E> {
        return true;
    }
}
