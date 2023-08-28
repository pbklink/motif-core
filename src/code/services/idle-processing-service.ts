/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

export class IdleProcessingService {
    private _callbacks = new Array<IdleProcessingService.Callback>();

    registerCallback(callback: IdleProcessingService.Callback) {
        this._callbacks.push(callback);
    }

    processNextCallback(): boolean {
        const callback = this._callbacks.shift();
        if (callback === undefined) {
            return false;
        } else {
            callback();
            return true;
        }
    }

    finalise() {
        let more: boolean;
        do {
            more = this.processNextCallback();
        } while (more);
    }
}

export namespace IdleProcessingService {
    export type Callback = (this: void) => void;
}
