/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

export class Cancellable {
    constructor (
        public readonly name: string, // for error reporting only
        public readonly priority: Cancellable.Priority,
        public readonly cancelEventer: Cancellable.ExecuteEventer,
    ) {
        // no code
    }

    cancel() {
        this.cancelEventer();
    }
}

export namespace Cancellable {
    export type ExecuteEventer = (this: void) => void;

    export const enum Priority {
        Menu = 100,
        High = 1000,
        Low = 10000,
    }
}
