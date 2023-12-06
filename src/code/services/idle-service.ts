/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, SysTick } from '../sys/sys-internal-api';

export class IdleService {
    private readonly _requestIdleCallbackAvailable: boolean;
    private readonly _requests = new Array<IdleService.Request>();

    private _callbackOrTimeoutHandle: number | ReturnType<typeof setTimeout> | undefined;
    private _callbackTimeoutTime: SysTick.Time;

    constructor() {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        this._requestIdleCallbackAvailable = globalThis.requestIdleCallback !== undefined;
    }

    finalise() {
        const requests = this._requests;
        const count = requests.length;
        for (let i = 0; i < count; i++) {
            const request = requests[i];
            request.cancel();
        }
        requests.length = 0;
    }

    addRequest<T>(callback: IdleService.Callback<T>, timeout: number): Promise<T | undefined> {
        const nowTime = SysTick.now();
        const timeoutTime = nowTime + timeout;
        let request: IdleService.TypedRequest<T> | undefined;
        const promise = new Promise<T | undefined>((resolve) => {
            request = new IdleService.TypedRequest<T>(
                timeoutTime,
                callback,
                resolve,
            );

            this._requests.push(request);
        });

        if (request === undefined) {
            throw new AssertInternalError('ISAR67230');
        } else {
            request.setPromise(promise);

            if (this._callbackOrTimeoutHandle === undefined) {
                this.requestIdleCallback(timeout, timeoutTime);
            } else {
                if (timeoutTime < this._callbackTimeoutTime) {
                    this.cancelIdleCallback();
                    this.requestIdleCallback(timeout, timeoutTime);
                }
            }

            return promise;
        }
    }

    cancelRequest(promise: Promise<unknown>) {
        const requests = this._requests;
        const count = requests.length;
        for (let i = 0; i < count; i++) {
            const requestItem = requests[i];
            if (requestItem.getPromise() === promise) {
                requestItem.cancel();
                requests.splice(i, 1);
                break;
            }
        }
    }

    private requestIdleCallback(timeout: number, timeoutTime: number) {
        this._callbackTimeoutTime = timeoutTime;

        if (this._requestIdleCallbackAvailable) {
            const options: IdleRequestOptions = {
                timeout,
            };
            this._callbackOrTimeoutHandle = requestIdleCallback(
                (deadline) => { this.idleCallback(deadline); },
                options
            );
        } else {
            // Safari does not support requestIdleCallback at this point in time.  Use setTimeout instead
            const deadline: IdleDeadline = {
                didTimeout: true,
                timeRemaining: () => 50,
            }
            this._callbackOrTimeoutHandle = setTimeout(
                () => { this.idleCallback(deadline) },
                timeout,
            );
        }
    }

    private cancelIdleCallback() {
        if (this._callbackOrTimeoutHandle === undefined) {
            throw new AssertInternalError('ISCIC50598');
        } else {
            if (this._requestIdleCallbackAvailable) {
                cancelIdleCallback(this._callbackOrTimeoutHandle as number);
            } else {
                clearTimeout(this._callbackOrTimeoutHandle);
            }
            this._callbackOrTimeoutHandle = undefined;
        }
    }

    private idleCallback(deadline: IdleDeadline) {
        this._callbackOrTimeoutHandle = undefined;

        const requests = this._requests;
        let resolvedCount = 0;
        while (resolvedCount < requests.length) {
            const request = requests[resolvedCount++];
            request.callbackAndResolve(deadline);
            if (deadline.timeRemaining() <= 0) {
                break;
            }
        }

        if (resolvedCount > 0) {
            this._requests.splice(0, resolvedCount);
        }

        if (this._requests.length > 0) {
            const earliestTimeoutTime = this.calculateEarliestTimeoutTime();
            let timeout = earliestTimeoutTime - SysTick.now();
            if (timeout < 0) {
                timeout = 0;
            }
            this.requestIdleCallback(timeout, earliestTimeoutTime);
        }
    }

    private calculateEarliestTimeoutTime() {
        // assumes at least one request exists
        const requests = this._requests;
        let result = requests[0].timeoutTime;
        const count = requests.length;
        for (let i = 1; i < count; i++) {
            const request = requests[i];
            const timeoutTime = request.timeoutTime;
            if (timeoutTime < result) {
                result = timeoutTime;
            }
        }
        return result;
    }
}

export namespace IdleService {
    export type Resolve<T> = (this: void, result: T | undefined) => void;
    export type Callback<T> = (this: void, deadline: IdleDeadline) => Promise<T | undefined>;

    export interface Request {
        readonly timeoutTime: SysTick.Time,
        readonly getPromise: () => Promise<unknown>;
        readonly callbackAndResolve: (deadline: IdleDeadline) => void;
        readonly cancel: () => void;
    }

    export class TypedRequest<T> implements Request {
        private _promise: Promise<T | undefined>;

        constructor(
            readonly timeoutTime: SysTick.Time,
            readonly callback: Callback<T | undefined>,
            readonly resolve: Resolve<T>,
        ) {
        }

        getPromise() {
            return this._promise;
        }

        setPromise(value: Promise<T | undefined>) {
            this._promise = value;
        }

        callbackAndResolve(deadline: IdleDeadline) {
            const result = this.callback(deadline);
            result.then(
                (value) => {
                    this.resolve(value);
                },
                (reason) => Promise.reject(reason),
            );
        }

        cancel() {
            this.resolve(undefined);
        }
    }
}
