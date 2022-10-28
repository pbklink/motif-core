/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridRecord } from './grid-revgrid-types';
import { Guid } from './types';

export interface LockOpenListItem extends GridRecord {
    readonly id: Guid;
    readonly name: string;
    readonly upperCaseName: string;

    lock(): void;
    unlock(): void;

    open(): void;
    close(): void;

    equals(other: LockOpenListItem): boolean;
}

export namespace LockOpenListItem {
    export interface Locker {
        readonly lockerName: string;
    }

    export interface Opener extends Locker {
    }
}
