/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, LitIvemId, LitIvemIdMatchesDataDefinition, LitIvemIdScanMatchesDataItem, RankScoredLitIvemIdList } from '../adi/adi-internal-api';
import { AssertInternalError, Guid, Integer, LockOpenListItem, Ok, Result } from "../sys/sys-internal-api";
import { WatchmakerList, WatchmakerService } from '../watchmaker/watchmaker-internal-api';
import { WatchmakerRankedLitIvemIdListDefinition } from './definition/ranked-lit-ivem-id-list-definition-internal-api';
import { ScoredRankedLitIvemIdList } from './scored-ranked-lit-ivem-id-list';

export class WatchmakerScoredRankedLitIvemIdList extends ScoredRankedLitIvemIdList {
    declare protected _sourceList: WatchmakerList;

    private readonly _scanId: Guid;

    // private _lockedScan: Scan | undefined;
    private _dataItem: LitIvemIdScanMatchesDataItem | undefined;

    constructor(
        private readonly _adiService: AdiService,
        private readonly _watchmakerService: WatchmakerService,
        definition: WatchmakerRankedLitIvemIdListDefinition,
    ) {
        super(definition, true, false, true, true);
        // this._scanId = definition.scanId;
    }

    override get name() {
        // const lockedScan = this._lockedScan;
        // if (lockedScan === undefined) {
        //     throw new AssertInternalError('SMSRLIILGN2085');
        // } else {
        //     return lockedScan.name;
        // }
        return '';
    }

    override get description() {
        // const lockedScan = this._lockedScan;
        // if (lockedScan === undefined) {
        //     throw new AssertInternalError('SMSRLIILGD20091');
        // } else {
        //     return lockedScan.description;
        // }
        return '';
    }

    override get category() {
        // const lockedScan = this._lockedScan;
        // if (lockedScan === undefined) {
        //     throw new AssertInternalError('SMSRLIILGD20091');
        // } else {
        //     return '';
        // }
        return '';
    }

    createDefinition(): WatchmakerRankedLitIvemIdListDefinition {
        return new WatchmakerRankedLitIvemIdListDefinition(this.id, '' /*this._scanId*/);
    }

    override tryLock(locker: LockOpenListItem.Locker): Promise<Result<void>> {
        // const serviceItemLockResult = this._scansService.tryLockItemByKey(this._scanId, locker);
        // if (serviceItemLockResult.isErr()) {
        //     return serviceItemLockResult.createOuter(ErrorCode.ScanMatchesLitIvemIdList_TryLock);
        // } else {
        //     this._lockedScan = serviceItemLockResult.value;
            return Ok.createResolvedPromise(undefined);
        // }
    }

    override unlock(locker: LockOpenListItem.Locker) {
        // if (this._lockedScan === undefined) {
        //     throw new AssertInternalError('SMLIILU26997');
        // } else {
        //     this._scansService.unlockItem(this._lockedScan, locker);
        //     this._lockedScan = undefined;
        // }
    }

    override subscribeRankScoredLitIvemIdSourceList(): RankScoredLitIvemIdList {
        if (this._dataItem !== undefined) {
            // cannot open more than once
            throw new AssertInternalError('SMRLIUILISRSLIISL31313');
        } else {
            const scanId = this._scanId;
            const dataDefinition = new LitIvemIdMatchesDataDefinition();
            dataDefinition.scanId = scanId;
            this._dataItem = this._adiService.subscribe(dataDefinition) as LitIvemIdScanMatchesDataItem;
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

    override userAdd(litIvemId: LitIvemId): Integer {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._sourceList === undefined) {
            throw new AssertInternalError('WSRLIIL22987');
        } else {
            return this._sourceList.initiateAddTo([litIvemId]);
        }
    }

    override userAddArray(litIvemIds: LitIvemId[]): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._sourceList === undefined) {
            throw new AssertInternalError('ERLIILIUAA31314');
        } else {
            this._sourceList.initiateAddTo(litIvemIds);
        }
    }

    override userReplaceAt(index: Integer, litIvemIds: LitIvemId[]): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._sourceList === undefined) {
            throw new AssertInternalError('ERLIILIURPA31314');
        } else {
            this._sourceList.initiateReplaceAt(index, litIvemIds);
        }
    }

    override userRemoveAt(index: Integer, count: Integer): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._sourceList === undefined) {
            throw new AssertInternalError('ERLIILIURMA31314');
        } else {
            this._sourceList.initiateRemoveAt(index, count);
        }
    }

    override userMoveAt(fromIndex: Integer, count: Integer, toIndex: Integer): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._sourceList === undefined) {
            throw new AssertInternalError('ERLIILIUMA31314');
        } else {
            this._sourceList.initiateMoveAt(fromIndex, count, toIndex);
        }
    }

    set(litIvemIds: LitIvemId[]): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._sourceList === undefined) {
            throw new AssertInternalError('ERLIILIS31314');
        } else {
            this._sourceList.initiateSetMembers(litIvemIds);
        }
    }

}
