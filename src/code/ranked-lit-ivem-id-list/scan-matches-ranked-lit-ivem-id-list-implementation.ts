/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, LitIvemIdMatchesDataDefinition, LitIvemIdMatchesDataItem } from '../adi/adi-internal-api';
import { Scan, ScansService } from '../scan/scan-internal-api';
import { AssertInternalError, ErrorCode, Guid, LockOpenListItem, Ok, Result } from "../sys/sys-internal-api";
import { ScanMatchesRankedLitIvemIdListDefinition } from './definition/ranked-lit-ivem-id-list-definition-internal-api';
import { RankScoredLitIvemIdSourceList } from './rank-scored-lit-ivem-id-source-list';
import { RankedLitIvemIdListImplementation } from './ranked-lit-ivem-id-list-implementation';

export class ScanMatchesRankedLitIvemIdListImplementation extends RankedLitIvemIdListImplementation {
    private readonly _scanId: Guid;

    private _lockedScan: Scan | undefined;
    private _dataItem: LitIvemIdMatchesDataItem | undefined;

    constructor(
        private readonly _adiService: AdiService,
        private readonly _scansService: ScansService,
        definition: ScanMatchesRankedLitIvemIdListDefinition,
    ) {
        super(false, false, false);
        this._scanId = definition.scanId;
    }

    createDefinition(): ScanMatchesRankedLitIvemIdListDefinition {
        return new ScanMatchesRankedLitIvemIdListDefinition(this._scanId);
    }

    override tryLock(locker: LockOpenListItem.Locker): Result<void> {
        const serviceItemLockResult = this._scansService.tryLockItemByKey(this._scanId, locker);
        if (serviceItemLockResult.isErr()) {
            return serviceItemLockResult.createOuter(ErrorCode.ScanMatchesLitIvemIdList_TryLock);
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
            this._lockedScan = undefined;
        }
    }

    override subscribeRankScoredLitIvemIdSourceList(): RankScoredLitIvemIdSourceList {
        if (this._dataItem !== undefined) {
            // cannot open more than once
            throw new AssertInternalError('SMRLIUILISRSLIISL31313');
        } else {
            const scanId = this._scanId;
            const dataDefinition = new LitIvemIdMatchesDataDefinition();
            dataDefinition.scanId = scanId;
            this._dataItem = this._adiService.subscribe(dataDefinition) as LitIvemIdMatchesDataItem;
            return this._dataItem;
        }
    }

    override unsubscribeRankScoredLitIvemIdSourceList(): void {
        if (this._dataItem === undefined) {
            throw new AssertInternalError('SMRLIUILIURSLIISL31313');
        } else {
            this._adiService.unsubscribe(this._dataItem);
            this._dataItem = undefined;
        }
    }
}
