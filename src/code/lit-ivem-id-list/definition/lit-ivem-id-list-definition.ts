/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { JsonElement, LockOpenListItem } from '../../sys/sys-internal-api';

export abstract class LitIvemIdListDefinition {
    constructor(readonly typeId: LitIvemIdListDefinition.TypeId) {

    }

    abstract loadFromJson(element: JsonElement): void;
    abstract saveToJson(element: JsonElement): void;

    abstract tryLock(locker: LockOpenListItem.Locker): boolean;
    abstract unlock(locker: LockOpenListItem.Locker): void;
}

export namespace LitIvemIdListDefinition {
    export const enum TypeId {
        Explicit,
        ZenithWatchlist,
        ScanMatches,
    }
}
