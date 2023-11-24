/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId, RankScoredLitIvemIdList } from '../adi/adi-internal-api';
import { AssertInternalError, Err, ErrorCode, Integer, LockOpenListItem, Ok, Result } from "../sys/sys-internal-api";
import { WatchmakerList, WatchmakerService } from '../watchmaker/watchmaker-internal-api';
import { WatchmakerRankedLitIvemIdListDefinition } from './definition/ranked-lit-ivem-id-list-definition-internal-api';
import { ScoredRankedLitIvemIdList } from './scored-ranked-lit-ivem-id-list';

export class WatchmakerScoredRankedLitIvemIdList extends ScoredRankedLitIvemIdList {
    declare protected _lockedSourceList: WatchmakerList;

    private readonly _watchmakerListId: string;

    constructor(
        private readonly _watchmakerService: WatchmakerService,
        definition: WatchmakerRankedLitIvemIdListDefinition,
    ) {
        super(definition, true, false, true, true);
        this._watchmakerListId = definition.watchmakerListId;
    }

    override get name() {
        // const lockedScan = this._lockedScan;
        // if (lockedScan === undefined) {
        //     throw new AssertInternalError('SMSRLIILGN2085');
        // } else {
        //     return lockedScan.name;
        // }
        return this._lockedSourceList.name;
    }

    override get description() {
        // const lockedScan = this._lockedScan;
        // if (lockedScan === undefined) {
        //     throw new AssertInternalError('SMSRLIILGD20091');
        // } else {
        //     return lockedScan.description;
        // }
        return this._lockedSourceList.description ?? '';
    }

    override get category() {
        // const lockedScan = this._lockedScan;
        // if (lockedScan === undefined) {
        //     throw new AssertInternalError('SMSRLIILGD20091');
        // } else {
        //     return '';
        // }
        return this._lockedSourceList.category ?? '';
    }

    createDefinition(): WatchmakerRankedLitIvemIdListDefinition {
        return new WatchmakerRankedLitIvemIdListDefinition('' /*this._scanId*/);
    }

    override async tryLock(locker: LockOpenListItem.Locker): Promise<Result<void>> {
        const watchmakerListId = this._watchmakerListId;
        const serviceItemLockResult = await this._watchmakerService.tryLockItemByKey(watchmakerListId, locker);
        if (serviceItemLockResult.isErr()) {
            return serviceItemLockResult.createOuter(ErrorCode.WatchmakerScoredRankLitIvemIdList_TryLock);
        } else {
            const watchmakerList = serviceItemLockResult.value;
            if (watchmakerList === undefined) {
                return new Err(`${ErrorCode.WatchmakerScoredRankLitIvemIdList_ScanIdNotFound}: ${watchmakerListId}`);
            } else {
                this._lockedSourceList = watchmakerList;
                return Ok.createResolvedPromise(undefined);
            }
        }
    }

    override unlock(locker: LockOpenListItem.Locker) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._lockedSourceList === undefined) {
            throw new AssertInternalError('WSRLIILU26997');
        } else {
            this._watchmakerService.unlockItem(this._lockedSourceList, locker);
            this._lockedSourceList = undefined as unknown as WatchmakerList;
        }
    }

    override subscribeRankScoredLitIvemIdSourceList(): RankScoredLitIvemIdList {
        return this._lockedSourceList;
    }

    override unsubscribeRankScoredLitIvemIdSourceList(): void {
        // nothing to do
    }

    override userAdd(litIvemId: LitIvemId): Integer {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._lockedSourceList === undefined) {
            throw new AssertInternalError('WSRLIIL22987');
        } else {
            return this._lockedSourceList.initiateAddTo([litIvemId]);
        }
    }

    override userAddArray(litIvemIds: LitIvemId[]): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._lockedSourceList === undefined) {
            throw new AssertInternalError('ERLIILIUAA31314');
        } else {
            this._lockedSourceList.initiateAddTo(litIvemIds);
        }
    }

    override userReplaceAt(index: Integer, litIvemIds: LitIvemId[]): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._lockedSourceList === undefined) {
            throw new AssertInternalError('ERLIILIURPA31314');
        } else {
            this._lockedSourceList.initiateReplaceAt(index, litIvemIds);
        }
    }

    override userRemoveAt(index: Integer, count: Integer): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._lockedSourceList === undefined) {
            throw new AssertInternalError('ERLIILIURMA31314');
        } else {
            this._lockedSourceList.initiateRemoveAt(index, count);
        }
    }

    override userMoveAt(fromIndex: Integer, count: Integer, toIndex: Integer): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._lockedSourceList === undefined) {
            throw new AssertInternalError('ERLIILIUMA31314');
        } else {
            this._lockedSourceList.initiateMoveAt(fromIndex, count, toIndex);
        }
    }

    set(litIvemIds: LitIvemId[]): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._lockedSourceList === undefined) {
            throw new AssertInternalError('ERLIILIS31314');
        } else {
            this._lockedSourceList.initiateSetMembers(litIvemIds);
        }
    }

}
