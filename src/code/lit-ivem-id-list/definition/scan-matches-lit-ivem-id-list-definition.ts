/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Scan, ScansService } from '../../scan/scan-internal-api';
import { AssertInternalError, ErrorCode, Guid, JsonElement, LockOpenListItem, Ok, Result } from '../../sys/sys-internal-api';
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

    tryLock(locker: LockOpenListItem.Locker): Result<void> {
        const serviceItemLockResult = this._scansService.tryLockItemByKey(this.scanId, locker);
        if (serviceItemLockResult.isErr()) {
            return serviceItemLockResult.createOuter(ErrorCode.ScanMatchesLitIvemIdListDefinition_TryLock);
        } else {
            this._lockedScan = serviceItemLockResult.value;
            return new Ok(undefined);
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
