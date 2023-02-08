/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../adi/adi-internal-api';
import {
    AssertInternalError,
    Badness,
    BadnessList,
    compareNumber,
    CorrectnessId,
    Integer,
    LockOpenListItem,
    MultiEvent,
    Ok,
    rangedAnyBinarySearch,
    RecordList,
    Result,
    UnreachableCaseError,
    UsableListChangeTypeId
} from "../sys/sys-internal-api";
import { RankedLitIvemIdListDefinition } from './definition/ranked-lit-ivem-id-list-definition-internal-api';
import { RankScoredLitIvemIdSourceList } from './rank-scored-lit-ivem-id-source-list';
import { RankedLitIvemId } from './ranked-lit-ivem-id';
import { RankedLitIvemIdList } from './ranked-lit-ivem-id-list';

/** @public */
export abstract class RankedLitIvemIdListImplementation implements RankedLitIvemIdList {
    private _records = new Array<RankedLitIvemId>();
    private _sortedRecords = new Array<RankedLitIvemId>();

    private _scoredRecordList: RankScoredLitIvemIdSourceList;
    private _scoredRecordListCorrectnessChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _scoredRecordListListChangeSubscriptionId: MultiEvent.SubscriptionId;

    private _listChangeMultiEvent = new MultiEvent<RecordList.ListChangeEventHandler>();
    private _badnessChangeMultiEvent = new MultiEvent<BadnessList.BadnessChangeEventHandler>();

    constructor(
        readonly typeId: RankedLitIvemIdList.TypeId,
        readonly userCanAdd: boolean,
        readonly userCanReplace: boolean,
        readonly userCanRemove: boolean,
        readonly userCanMove: boolean,
    ) {
    }

    get usable() { return this._scoredRecordList.usable; }
    get badness(): Badness { return this._scoredRecordList.badness; }
    get correctnessId(): CorrectnessId { return this._scoredRecordList.correctnessId; }

    get count() { return this._records.length; }

    tryLock(_locker: LockOpenListItem.Locker): Result<void> {
        // descendants can override
        return new Ok(undefined);
    }

    unlock(_locker: LockOpenListItem.Locker) {
        // descendants can override
    }

    openLocked(_opener: LockOpenListItem.Opener): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._scoredRecordList !== undefined) {
            // cannot open more than once
            throw new AssertInternalError('RLIILIO31313');
        } else {
            this._scoredRecordList = this.subscribeRankScoredLitIvemIdSourceList();

            const existingCount = this._scoredRecordList.count;
            if (existingCount > 0) {
                this.insertRecords(0, existingCount, false);
            }

            this._scoredRecordListCorrectnessChangeSubscriptionId = this._scoredRecordList.subscribeCorrectnessChangedEvent(
                () => this.processDataItemCorrectnessChanged()
            );
            this._scoredRecordListListChangeSubscriptionId = this._scoredRecordList.subscribeListChangeEvent(
                (listChangeTypeId, index, count) => this.processDataItemListChange(listChangeTypeId, index, count)
            );
        }
    }

    closeLocked(_opener: LockOpenListItem.Opener): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._scoredRecordList === undefined) {
            throw new AssertInternalError('RLIILIC31313');
        } else {
            this._scoredRecordList.unsubscribeListChangeEvent(this._scoredRecordListListChangeSubscriptionId);
            this._scoredRecordListListChangeSubscriptionId = undefined;
            this._scoredRecordList.unsubscribeCorrectnessChangedEvent(this._scoredRecordListCorrectnessChangeSubscriptionId);
            this._scoredRecordListCorrectnessChangeSubscriptionId = undefined;
            this.unsubscribeRankScoredLitIvemIdSourceList();
        }
    }

    indexOf(record: RankedLitIvemId) {
        const count = this.count;
        for (let index = 0; index < count; index++) {
            if (this._records[index] === record) {
                return index;
            }
        }
        return -1;
    }

    getAt(index: number): RankedLitIvemId {
        return this._records[index];
    }

    userAdd(_litIvemId: LitIvemId): Integer {
        throw new AssertInternalError('RLIILIUA31313');
    }

    userAddArray(_litIvemIds: LitIvemId[]): void {
        throw new AssertInternalError('RLIILIUAA31313');
    }

    userReplaceAt(_index: number, _litIvemIds: LitIvemId[]): void {
        throw new AssertInternalError('RLIILIURPA31313');
    }

    userRemoveAt(_index: number, _count: number): void {
        throw new AssertInternalError('RLIILIURMA31313');
    }

    userMoveAt(_fromIndex: number, _count: number, _toIndex: number): void {
        throw new AssertInternalError('RLIILIUMA31313');
    }

    subscribeBadnessChangeEvent(handler: BadnessList.BadnessChangeEventHandler) {
        return this._badnessChangeMultiEvent.subscribe(handler);
    }

    unsubscribeBadnessChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void {
        this._badnessChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeListChangeEvent(handler: RecordList.ListChangeEventHandler) {
        return this._listChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void {
        return this._listChangeMultiEvent.unsubscribe(subscriptionId);
    }

    private processDataItemCorrectnessChanged() {
        const correctnessId = this._scoredRecordList.correctnessId;
        for (const rankedLitIvemId of this._records) {
            rankedLitIvemId.setCorrectnessId(correctnessId);
        }
    }

    private processDataItemListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                // nothing to do - DataItem badness event will handle
                break;
            case UsableListChangeTypeId.PreUsableClear:
                this._records.length = 0;
                this.notifyListChange(listChangeTypeId, index, count);
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                this.insertRecords(index, count, false);
                this.notifyListChange(listChangeTypeId, index, count);
                break;
            case UsableListChangeTypeId.Usable:
                // handled through badness change
                break;
            case UsableListChangeTypeId.Insert:
                this.insertRecords(index, count, true);
                break;
            case UsableListChangeTypeId.Replace:
                throw new AssertInternalError('RLIILIPDILCDR54483');
            case UsableListChangeTypeId.Remove:
                this.removeRecords(index, count);
                break;
            case UsableListChangeTypeId.Clear:
                this.checkUsableNotifyListChange(listChangeTypeId, index, count);
                this.clearRecords();
                break;
            default:
                throw new UnreachableCaseError('RLIILIPDILCD54483', listChangeTypeId);
        }
    }

    private insertRecords(index: Integer, insertCount: Integer, checkNotify: boolean) {
        if (insertCount > 0) {
            const toBeInsertedRecords = new Array<RankedLitIvemId>(insertCount);
            const scoredRecordList = this._scoredRecordList;
            const correctnessId = this._scoredRecordList.correctnessId;
            for (let i = 0; i < insertCount; i++) {
                const matchRecord = scoredRecordList.getAt(index + i);
                toBeInsertedRecords[i] = new RankedLitIvemId(matchRecord.litIvemId, correctnessId, -1, matchRecord.rankScore);
            }

            this._records.splice(index, 0, ...toBeInsertedRecords);
            this.insertIntoSorting(toBeInsertedRecords);

            if (checkNotify) {
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, index, insertCount);
            }
        }
    }

    private insertIntoSorting(insertRecords: RankedLitIvemId[]) {
        const insertCount = insertRecords.length;
        const existingCount = this.count
        if (existingCount === 0 || insertCount >= 0.3 * existingCount) {
            this.insertIntoSortingWithResortAll(insertRecords);
        } else {
            this.insertIntoSortingIndividually(insertRecords);
        }

    }

    private insertIntoSortingWithResortAll(insertRecords: RankedLitIvemId[]) {
        const sortedRecords = this._sortedRecords;
        const oldCount = sortedRecords.length;
        const oldSortedRecords = sortedRecords.slice();
        sortedRecords.splice(oldCount, 0, ...insertRecords);
        sortedRecords.sort((left, right) => compareNumber(left.rankScore, right.rankScore));
        let firstReindexedIndex = oldCount;
        for (let i = 0; i < oldCount; i++) {
            const oldRankedLitIvemId = oldSortedRecords[i];
            const newRankedLitIvemId = sortedRecords[i];
            if (oldRankedLitIvemId !== newRankedLitIvemId) {
                firstReindexedIndex = i;
                break;
            }
        }

        const sortRecordsCount = sortedRecords.length;
        for (let i = firstReindexedIndex; i < sortRecordsCount; i++) {
            const record = sortedRecords[i];
            record.setRank(i + 1);
        }
    }

    private insertIntoSortingIndividually(insertRecords: RankedLitIvemId[]) {
        const sortedRecords = this._sortedRecords;
        let sortedRecordsCount = sortedRecords.length;
        let minSortInsertIndex = Number.MAX_SAFE_INTEGER;
        for (const record of insertRecords) {
            const searchResult = rangedAnyBinarySearch(
                sortedRecords,
                record,
                (left, right) => compareNumber(left.rankScore, right.rankScore),
                0,
                sortedRecordsCount
            );
            const insertIndex = searchResult.index;
            sortedRecords.splice(searchResult.index, 0, record);
            if (insertIndex < minSortInsertIndex) {
                minSortInsertIndex = insertIndex;
            }
            sortedRecordsCount += 1;
        }

        this.reRank(minSortInsertIndex);
    }

    private removeRecords(index: Integer, removeCount: Integer) {
        if (removeCount > 0) {
            this.checkUsableNotifyListChange(UsableListChangeTypeId.Remove, index, removeCount);

            const sortedRecords = this._sortedRecords;
            const sortedRecordsCount = sortedRecords.length;
            if (removeCount === sortedRecordsCount) {
                this.clearRecords();
            } else {
                const nextRangeIndex = index + removeCount;
                for (let i = index; i < nextRangeIndex; i++) {
                    const rankedLitIvemId = this._records[i];
                    rankedLitIvemId.setInvalidRank();
                }

                sortedRecords.sort((left, right) => compareNumber(left.rank, right.rank));

                for (let i = 0; i < sortedRecordsCount; i++) {
                    const rankedLitIvemId = sortedRecords[i];
                    if (!rankedLitIvemId.isRankInvalid()) {
                        sortedRecords.splice(0, i);
                        break;
                    }
                }

                this._records.splice(index, removeCount);

                this.reRank(index);
            }
        }
    }

    private clearRecords() {
        this._records.length = 0;
        this._sortedRecords.length = 0;
    }

    private reRank(startIndex: Integer) {
        const sortedRecords = this._sortedRecords;
        const sortedRecordsCount = sortedRecords.length;
        for (let i = startIndex; i < sortedRecordsCount; i++) {
            const record = sortedRecords[i];
            record.setRank(i + 1);
        }
    }

    private notifyListChange(listChangeTypeId: UsableListChangeTypeId, recIdx: Integer, recCount: Integer) {
        const handlers = this._listChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, recIdx, recCount);
        }
    }

    private checkUsableNotifyListChange(listChangeTypeId: UsableListChangeTypeId, recIdx: Integer, recCount: Integer) {
        if (this.usable) {
            this.notifyListChange(listChangeTypeId, recIdx, recCount);
        }
    }

    abstract createDefinition(): RankedLitIvemIdListDefinition;
    abstract subscribeRankScoredLitIvemIdSourceList(): RankScoredLitIvemIdSourceList;
    abstract unsubscribeRankScoredLitIvemIdSourceList(): void;
}
