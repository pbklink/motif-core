/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Guid, JsonElement, LockOpenListItem } from '../../sys/sys-internal-api';
import { LitIvemIdListDefinition } from './lit-ivem-id-list-definition';

export class ZenithWatchlistLitIvemIdListDefinition extends LitIvemIdListDefinition {
    constructor(
        readonly watchlistId: Guid
    ) {
        super(LitIvemIdListDefinition.TypeId.ZenithWatchlist);
    }

    loadFromJson(element: JsonElement) {

    }

    saveToJson(element: JsonElement) {

    }

    tryLock(_locker: LockOpenListItem.Locker) {
        // const scan = this._scansService.lockItemById(this.scanId, locker);
        // if (scan === undefined) {
        //     return true;
        // } else {
        //     this._lockedScan = scan;
            return false;
        // }
    }

    unlock(locker: LockOpenListItem.Locker) {
        // if (this._lockedScan === undefined) {
        //     throw new AssertInternalError('SMLIILU26997');
        // } else {
        //     this._scansService.unlockItem(this._lockedScan, locker);
        // }
    }
}
