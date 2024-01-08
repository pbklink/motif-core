/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Integer, SysTick } from '../sys/sys-internal-api';

export class IdleService {
    private readonly _requestIdleCallbackAvailable: boolean;
    private readonly _requests = new Array<IdleService.Request>();
    private readonly _idleWaitingRequests = new Array<IdleService.IdleWaitingRequest>();

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
        this._idleWaitingRequests.length = 0;

        if (this._callbackOrTimeoutHandle !== undefined) {
            this.cancelIdleCallback();
        }
    }

    addRequest<T>(callback: IdleService.Callback<T>, idleTimeout: number, delayTime?: Integer): Promise<T | undefined> {
        let request: IdleService.TypedRequest<T> | undefined;
        const promise = new Promise<T | undefined>((resolve) => {
            request = new IdleService.TypedRequest<T>(
                delayTime,
                idleTimeout,
                callback,
                resolve,
                (idleWaitingReadyRequest) => { this.addRequestToIdleWaitingRequests(idleWaitingReadyRequest); }
            );

            this._requests.push(request);
        });

        if (request === undefined) {
            throw new AssertInternalError('ISAR67230');
        } else {
            request.setPromise(promise);

            if (delayTime === undefined) {
                this.addRequestToIdleWaitingRequests(request);
            }

            return promise;
        }
    }

    cancelRequest(promise: Promise<unknown>) {
        const requests = this._requests;
        const count = requests.length;
        let foundRequest: IdleService.Request | undefined;
        for (let i = 0; i < count; i++) {
            const request = requests[i];
            if (request.getPromise() === promise) {
                foundRequest = request;
                request.cancel();
                requests.splice(i, 1);
                break;
            }
        }

        if (foundRequest !== undefined) {
            const idleWaitingRequests = this._idleWaitingRequests;
            const idleWaitingCount = idleWaitingRequests.length;
            for (let i = 0; i < idleWaitingCount; i++) {
                const idleWaitingRequest = idleWaitingRequests[i];
                if (idleWaitingRequest.request === foundRequest) {
                    idleWaitingRequests.splice(i, 1);
                    break;
                }
            }
        }
    }

    private addRequestToIdleWaitingRequests(request: IdleService.Request) {
        const nowTime = SysTick.now();
        const idleTimeout = request.idleTimeout;
        const idleTimeoutTime = nowTime + idleTimeout;

        this._idleWaitingRequests.push({
            idleTimeoutTime,
            request,
        });

        if (this._callbackOrTimeoutHandle === undefined) {
            this.requestIdleCallback(idleTimeout, idleTimeoutTime);
        } else {
            if (idleTimeoutTime < this._callbackTimeoutTime) {
                this.cancelIdleCallback();
                this.requestIdleCallback(idleTimeout, idleTimeoutTime);
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
        const idleWaitingRequests = this._idleWaitingRequests;
        let resolvedCount = 0;
        while (resolvedCount < idleWaitingRequests.length) {
            const idleWaitingRequest = idleWaitingRequests[resolvedCount++];
            const request = idleWaitingRequest.request;

            request.callbackAndResolve(deadline);

            const requestIndex = requests.indexOf(request);
            if (requestIndex < 0) {
                throw new AssertInternalError('ISIC55812');
            } else {
                request.confirmNotDelayed();
                requests.splice(requestIndex, 1);

                if (deadline.timeRemaining() <= 0) {
                    break;
                }
            }
        }

        if (resolvedCount > 0) {
            this._idleWaitingRequests.splice(0, resolvedCount);
        }

        if (this._idleWaitingRequests.length > 0) {
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
        const idleWaitingRequests = this._idleWaitingRequests;
        let result = idleWaitingRequests[0].idleTimeoutTime;
        const count = idleWaitingRequests.length;
        for (let i = 1; i < count; i++) {
            const idleWaitingRequest = idleWaitingRequests[i];
            const timeoutTime = idleWaitingRequest.idleTimeoutTime;
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
        readonly idleTimeout: number,
        readonly getPromise: () => Promise<unknown>;
        readonly callbackAndResolve: (deadline: IdleDeadline) => void;
        readonly cancel: () => void;
        readonly confirmNotDelayed: () => void;
    }

    export namespace Request {
        export type IdleWaitEventer = (this: void, request: Request) => void;
    }

    export class TypedRequest<T> implements Request {
        private _promise: Promise<T | undefined>;
        private _delayTimeoutHandle: ReturnType<typeof setTimeout> | undefined;

        constructor(
            readonly delayTime: Integer | undefined,
            readonly idleTimeout: number,
            readonly callback: Callback<T | undefined>,
            readonly resolve: Resolve<T>,
            private readonly _idleWaitEventer: Request.IdleWaitEventer,
        ) {
            if (delayTime !== undefined) {
                this._delayTimeoutHandle = setTimeout(
                    () =>  {
                        this._delayTimeoutHandle = undefined;
                        this._idleWaitEventer(this);
                    },
                    delayTime,
                );
            }
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
            if (this._delayTimeoutHandle !== undefined) {
                clearTimeout(this._delayTimeoutHandle);
                this._delayTimeoutHandle = undefined;
            }
            this.resolve(undefined);
        }

        confirmNotDelayed() {
            if (this._delayTimeoutHandle !== undefined) {
                throw new AssertInternalError('ISTRCND34344');
            }
        }
    }

    export interface IdleWaitingRequest {
        readonly idleTimeoutTime: SysTick.Time;
        readonly request: Request;
    }
}
