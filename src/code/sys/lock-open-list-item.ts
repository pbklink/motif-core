/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MapKeyed } from './map-keyed';
import { Result } from './result';
import { IndexedRecord, Integer } from './types';

export interface LockOpenListItem<T> extends MapKeyed, IndexedRecord {
    readonly lockCount: Integer;
    readonly lockers: readonly LockOpenListItem.Locker[];
    readonly openCount: Integer;
    readonly openers: readonly LockOpenListItem.Opener[];

    tryLock(locker: LockOpenListItem.Locker): Promise<Result<void>>;
    openLocked(opener: LockOpenListItem.Opener): void;
    closeLocked(opener: LockOpenListItem.Opener): void;
    unlock(locker: LockOpenListItem.Locker): void;
    isLocked(ignoreOnlyLocker: LockOpenListItem.Locker | undefined): boolean;

    // tryProcessFirstLock(locker: LockOpenListItem.Locker): Promise<Result<void>>;
    // processLastUnlock(locker: LockOpenListItem.Locker): void;
    // processFirstOpen(opener: LockOpenListItem.Opener): void;
    // processLastClose(opener: LockOpenListItem.Opener): void;

    equals(other: T): boolean;
}

export namespace LockOpenListItem {
    export interface Locker {
        lockerName: string;
    }

    export interface Opener extends Locker {
    }
}
