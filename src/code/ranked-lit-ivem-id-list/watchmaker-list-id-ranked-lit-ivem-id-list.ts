/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId, RankScoredLitIvemIdList } from '../adi/internal-api';
import { AssertInternalError, Err, ErrorCode, Integer, LockOpenListItem, Ok, Result } from "../sys/internal-api";
import { WatchmakerList, WatchmakerService } from '../watchmaker/internal-api';
import { BaseRankedLitIvemIdList } from './base-ranked-lit-ivem-id-list';
import { WatchmakerListIdRankedLitIvemIdListDefinition } from './definition/internal-api';

export class WatchmakerListIdRankedLitIvemIdList extends BaseRankedLitIvemIdList {
    declare protected _lockedScoredList: WatchmakerList;

    private readonly _watchmakerListId: string;

    constructor(
        private readonly _watchmakerService: WatchmakerService,
        definition: WatchmakerListIdRankedLitIvemIdListDefinition,
    ) {
        super(definition.typeId, true, false, true, true);
        this._watchmakerListId = definition.watchmakerListId;
    }

    override get name() {
        // const lockedScan = this._lockedScan;
        // if (lockedScan === undefined) {
        //     throw new AssertInternalError('SMSRLIILGN2085');
        // } else {
        //     return lockedScan.name;
        // }
        return this._lockedScoredList.name;
    }

    override get description() {
        // const lockedScan = this._lockedScan;
        // if (lockedScan === undefined) {
        //     throw new AssertInternalError('SMSRLIILGD20091');
        // } else {
        //     return lockedScan.description;
        // }
        return this._lockedScoredList.description ?? '';
    }

    override get category() {
        // const lockedScan = this._lockedScan;
        // if (lockedScan === undefined) {
        //     throw new AssertInternalError('SMSRLIILGD20091');
        // } else {
        //     return '';
        // }
        return this._lockedScoredList.category ?? '';
    }

    createDefinition(): WatchmakerListIdRankedLitIvemIdListDefinition {
        return new WatchmakerListIdRankedLitIvemIdListDefinition('' /*this._scanId*/);
    }

    override async tryLock(locker: LockOpenListItem.Locker): Promise<Result<void>> {
        const watchmakerListId = this._watchmakerListId;
        const serviceItemLockResult = await this._watchmakerService.tryLockItemByKey(watchmakerListId, locker);
        if (serviceItemLockResult.isErr()) {
            return serviceItemLockResult.createOuter(ErrorCode.WatchmakerListIdRankLitIvemIdList_TryLock);
        } else {
            const watchmakerList = serviceItemLockResult.value;
            if (watchmakerList === undefined) {
                return new Err(`${ErrorCode.WatchmakerListIdRankLitIvemIdList_ScanIdNotFound}: ${watchmakerListId}`);
            } else {
                this._lockedScoredList = watchmakerList;
                return Ok.createResolvedPromise(undefined);
            }
        }
    }

    override unlock(locker: LockOpenListItem.Locker) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._lockedScoredList === undefined) {
            throw new AssertInternalError('WSRLIILU26997');
        } else {
            this._watchmakerService.unlockItem(this._lockedScoredList, locker);
            this._lockedScoredList = undefined as unknown as WatchmakerList;
        }
    }

    override subscribeRankScoredLitIvemIdList(): RankScoredLitIvemIdList {
        return this._lockedScoredList;
    }

    override unsubscribeRankScoredLitIvemIdList(): void {
        // nothing to do
    }

    override userAdd(litIvemId: LitIvemId): Integer {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._lockedScoredList === undefined) {
            throw new AssertInternalError('WSRLIIL22987');
        } else {
            return this._lockedScoredList.initiateAddTo([litIvemId]);
        }
    }

    override userAddArray(litIvemIds: LitIvemId[]): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._lockedScoredList === undefined) {
            throw new AssertInternalError('ERLIILIUAA31314');
        } else {
            this._lockedScoredList.initiateAddTo(litIvemIds);
        }
    }

    override userReplaceAt(index: Integer, litIvemIds: LitIvemId[]): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._lockedScoredList === undefined) {
            throw new AssertInternalError('ERLIILIURPA31314');
        } else {
            this._lockedScoredList.initiateReplaceAt(index, litIvemIds);
        }
    }

    override userRemoveAt(index: Integer, count: Integer): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._lockedScoredList === undefined) {
            throw new AssertInternalError('ERLIILIURMA31314');
        } else {
            this._lockedScoredList.initiateRemoveAt(index, count);
        }
    }

    override userMoveAt(fromIndex: Integer, count: Integer, toIndex: Integer): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._lockedScoredList === undefined) {
            throw new AssertInternalError('ERLIILIUMA31314');
        } else {
            this._lockedScoredList.initiateMoveAt(fromIndex, count, toIndex);
        }
    }

    set(litIvemIds: LitIvemId[]): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._lockedScoredList === undefined) {
            throw new AssertInternalError('ERLIILIS31314');
        } else {
            this._lockedScoredList.initiateSetMembers(litIvemIds);
        }
    }

}
