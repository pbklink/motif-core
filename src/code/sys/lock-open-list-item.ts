/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MapKeyed } from './map-keyed';
import { Result } from './result';
import { IndexedRecord } from './types';

export interface LockOpenListItem<T> extends MapKeyed, IndexedRecord {
    tryProcessFirstLock(locker: LockOpenListItem.Locker): Promise<Result<void>>;
    processLastUnlock(locker: LockOpenListItem.Locker): void;

    processFirstOpen(opener: LockOpenListItem.Opener): void;
    processLastClose(opener: LockOpenListItem.Opener): void;

    equals(other: T): boolean;
}

export namespace LockOpenListItem {
    export interface Locker {
        lockerName: string;
    }

    export interface Opener extends Locker {
    }
}
