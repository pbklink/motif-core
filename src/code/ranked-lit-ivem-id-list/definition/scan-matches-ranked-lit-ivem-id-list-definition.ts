/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Scan, ScansService } from '../../scan/scan-internal-api';
import { AssertInternalError, ErrorCode, Guid, JsonElement, LockOpenListItem, Ok, Result } from '../../sys/sys-internal-api';
import { RankedLitIvemIdListDefinition } from './ranked-lit-ivem-id-list-definition';

/** @public */
export class ScanMatchesRankedLitIvemIdListDefinition extends RankedLitIvemIdListDefinition {
    private _lockedScan: Scan | undefined;

    constructor(
        public readonly _scansService: ScansService,
        readonly scanId: Guid,
    ) {
        super(RankedLitIvemIdListDefinition.TypeId.ScanMatches);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        element.setString(ScanMatchesRankedLitIvemIdListDefinition.JsonName.scanId, this.scanId);
    }

    override tryLock(locker: LockOpenListItem.Locker): Result<void> {
        const serviceItemLockResult = this._scansService.tryLockItemByKey(this.scanId, locker);
        if (serviceItemLockResult.isErr()) {
            return serviceItemLockResult.createOuter(ErrorCode.ScanMatchesLitIvemIdListDefinition_TryLock);
        } else {
            this._lockedScan = serviceItemLockResult.value;
            return new Ok(undefined);
        }
    }

    override unlock(locker: LockOpenListItem.Locker) {
        if (this._lockedScan === undefined) {
            throw new AssertInternalError('SMLIILU26997');
        } else {
            this._scansService.unlockItem(this._lockedScan, locker);
        }
    }
}

/** @public */
export namespace ScanMatchesRankedLitIvemIdListDefinition {
    export namespace JsonName {
        export const scanId = 'scanId';
    }

    export function tryCreateFromJson(
        scansService: ScansService,
        element: JsonElement
    ): Result<ScanMatchesRankedLitIvemIdListDefinition> {
        const scanIdResult = element.tryGetStringType(JsonName.scanId);
        if (scanIdResult.isErr()) {
            return scanIdResult.createOuter(ErrorCode.ScanMatchesLitIvemIdListDefinition_ScanId);
        } else {
            const definition = new ScanMatchesRankedLitIvemIdListDefinition(scansService, scanIdResult.value);
            return new Ok(definition);
        }
    }
}
