/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Scan, ScansService } from '../../scan/scan-internal-api';
import { AssertInternalError, ErrorCode, Guid, JsonElement, LockOpenListItem, Ok, Result } from '../../sys/sys-internal-api';
import { IdLitIvemIdListDefinition } from './id-lit-ivem-id-list-definition';
import { LitIvemIdListDefinition } from './lit-ivem-id-list-definition';

/** @public */
export class ScanMatchesLitIvemIdListDefinition extends IdLitIvemIdListDefinition {
    private _lockedScan: Scan | undefined;

    constructor(
        public readonly _scansService: ScansService,
        id: Guid,
        readonly scanId: Guid,
    ) {
        super(LitIvemIdListDefinition.TypeId.ScanMatches, id);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        element.setString(ScanMatchesLitIvemIdListDefinition.JsonName.scanId, this.scanId);
    }

    tryLock(locker: LockOpenListItem.Locker): Result<LitIvemIdListDefinition> {
        const serviceItemLockResult = this._scansService.tryLockItemByKey(this.scanId, locker);
        if (serviceItemLockResult.isErr()) {
            return serviceItemLockResult.createOuter(ErrorCode.ScanMatchesLitIvemIdListDefinition_TryLock);
        } else {
            this._lockedScan = serviceItemLockResult.value;
            return new Ok(this);
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

/** @public */
export namespace ScanMatchesLitIvemIdListDefinition {
    export namespace JsonName {
        export const scanId = 'scanId';
    }

    export function tryCreateFromJson(
        scansService: ScansService,
        element: JsonElement
    ): Result<ScanMatchesLitIvemIdListDefinition> {
        const idResult = IdLitIvemIdListDefinition.tryGetIdFromJson(element);
        if (idResult.isErr()) {
            return idResult.createOuter(ErrorCode.ScanMatchesLitIvemIdListDefinition_Id);
        } else {
            const scanIdResult = element.tryGetStringType(JsonName.scanId);
            if (scanIdResult.isErr()) {
                return scanIdResult.createOuter(ErrorCode.ScanMatchesLitIvemIdListDefinition_ScanId);
            } else {
                const definition = new ScanMatchesLitIvemIdListDefinition(scansService, idResult.value, scanIdResult.value);
                return new Ok(definition);
            }
        }
    }
}
