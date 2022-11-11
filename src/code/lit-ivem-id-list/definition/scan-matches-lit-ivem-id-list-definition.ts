/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Scan } from '../../scan/scan-internal-api';
import { ScansService } from '../../scan/scans-service';
import { AssertInternalError, JsonElement, LockOpenListItem } from '../../sys/sys-internal-api';
import { Guid } from '../../sys/types';
import { LitIvemIdListDefinition } from './lit-ivem-id-list-definition';

export class ScanMatcheslistLitIvemIdListDefinition extends LitIvemIdListDefinition {
    private _lockedScan: Scan | undefined;

    constructor(
        public readonly _scansService: ScansService,
        readonly scanId: Guid,
    ) {
        super(LitIvemIdListDefinition.TypeId.ScanMatches);

    }

    loadFromJson(element: JsonElement) {

    }

    saveToJson(element: JsonElement) {

    }

    tryLock(locker: LockOpenListItem.Locker) {
        const scan = this._scansService.lockItemByKey(this.scanId, locker);
        if (scan === undefined) {
            return true;
        } else {
            this._lockedScan = scan;
            return false;
        }
    }

    unlock(locker: LockOpenListItem.Locker) {
        if (this._lockedScan === undefined) {
            throw new AssertInternalError('SMLIILU26997');
        } else {
            this._scansService.unlockItem(this._lockedScan, locker);
        }
    }
}
