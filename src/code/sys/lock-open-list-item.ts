/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridRecord } from './grid-revgrid-types';
import { MapKeyed } from './map-keyed';
import { Result } from './result';

export interface LockOpenListItem extends MapKeyed, GridRecord {
    readonly mapKey: string;

    openLocked(opener: LockOpenListItem.Opener): void;
    closeLocked(opener: LockOpenListItem.Opener): void;

    tryProcessFirstLock(): Result<void>;
    processLastUnlock(): void;

    tryProcessFirstOpen(): Result<void>;
    processLastClose(): void;

    equals(other: LockOpenListItem): boolean;
}

export namespace LockOpenListItem {
    export interface Locker {
        readonly lockerName: string;
    }

    export interface Opener extends Locker {
    }
}
