/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, LitIvemIdMatchesDataDefinition, LitIvemIdScanMatchesDataItem } from '../adi/adi-internal-api';
import { Scan, ScansService } from '../scan/scan-internal-api';
import { AssertInternalError, ErrorCode, Guid, LockOpenListItem, Ok, Result } from "../sys/sys-internal-api";
import { ScanMatchesRankedLitIvemIdListDefinition } from './definition/ranked-lit-ivem-id-list-definition-internal-api';
import { RankScoredLitIvemIdSourceList } from './rank-scored-lit-ivem-id-source-list';
import { ScoredRankedLitIvemIdList } from './scored-ranked-lit-ivem-id-list';

export class ScanMatchesScoredRankedLitIvemIdList extends ScoredRankedLitIvemIdList {
    private readonly _scanId: Guid;

    private _lockedScan: Scan | undefined;
    private _dataItem: LitIvemIdScanMatchesDataItem | undefined;

    constructor(
        private readonly _adiService: AdiService,
        private readonly _scansService: ScansService,
        definition: ScanMatchesRankedLitIvemIdListDefinition,
    ) {
        super(definition, false, false, false, false);
        this._scanId = definition.scanId;
    }

    override get name() {
        const lockedScan = this._lockedScan;
        if (lockedScan === undefined) {
            throw new AssertInternalError('SMSRLIILGN2085');
        } else {
            return lockedScan.name;
        }
    }

    override get description() {
        const lockedScan = this._lockedScan;
        if (lockedScan === undefined) {
            throw new AssertInternalError('SMSRLIILGD20091');
        } else {
            return lockedScan.description;
        }
    }

    override get category() {
        const lockedScan = this._lockedScan;
        if (lockedScan === undefined) {
            throw new AssertInternalError('SMSRLIILGD20091');
        } else {
            return '';
        }
    }

    createDefinition(): ScanMatchesRankedLitIvemIdListDefinition {
        return new ScanMatchesRankedLitIvemIdListDefinition(this.id, this._scanId);
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
            throw new AssertInternalError('SMSRLIILSRSLIISLD31313');
        } else {
            const lockedScan = this._lockedScan;
            if (lockedScan === undefined) {
                throw new AssertInternalError('SMSRLIILSRSLIISLL31313');
            } else {
                const scanId = lockedScan.id;
                const dataDefinition = new LitIvemIdMatchesDataDefinition();
                dataDefinition.scanId = scanId;
                this._dataItem = this._adiService.subscribe(dataDefinition) as LitIvemIdScanMatchesDataItem;
                return this._dataItem;
            }
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
