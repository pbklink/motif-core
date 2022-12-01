/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IndexedRecord } from './types';
import { MapKeyed } from './map-keyed';
import { Result } from './result';

export interface LockOpenListItem extends MapKeyed, IndexedRecord {
    readonly mapKey: string;

    tryProcessFirstLock(locker: LockOpenListItem.Locker): Result<void>;
    processLastUnlock(locker: LockOpenListItem.Locker): void;

    processFirstOpen(opener: LockOpenListItem.Opener): void;
    processLastClose(opener: LockOpenListItem.Opener): void;

    equals(other: LockOpenListItem): boolean;
}

export namespace LockOpenListItem {
    export interface Locker {
        readonly lockerName: string;
    }

    export interface Opener extends Locker {
    }
}
