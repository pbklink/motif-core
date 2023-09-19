/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../adi/adi-internal-api';
import {
    anyBinarySearch,
    AssertInternalError,
    Badness,
    BadnessList,
    compareNumber,
    CorrectnessId,
    Guid,
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
export abstract class ScoredRankedLitIvemIdList implements RankedLitIvemIdList {
    readonly id: Guid;
    readonly typeId: RankedLitIvemIdListDefinition.TypeId;

    // Only used by Json to mark referential as dirty and needing to be saved
    referentialTargettedModifiedEventer: ScoredRankedLitIvemIdList.ModifiedEventer | undefined;

    protected _sourceList: RankScoredLitIvemIdSourceList;

    private _records = new Array<RankedLitIvemId>();
    private _rankSortedRecords = new Array<RankedLitIvemId>();

    private _sourceListCorrectnessChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _sourceListListChangeSubscriptionId: MultiEvent.SubscriptionId;

    private _listChangeMultiEvent = new MultiEvent<RecordList.ListChangeEventHandler>();
    private _badnessChangeMultiEvent = new MultiEvent<BadnessList.BadnessChangeEventHandler>();

    constructor(
        definition: RankedLitIvemIdListDefinition,
        readonly userCanAdd: boolean,
        readonly userCanReplace: boolean,
        readonly userCanRemove: boolean,
        readonly userCanMove: boolean,
    ) {
        this.id = definition.id;
        this.typeId = definition.typeId;
    }

    get usable() { return this._sourceList.usable; }
    get badness(): Badness { return this._sourceList.badness; }
    get correctnessId(): CorrectnessId { return this._sourceList.correctnessId; }

    get count() { return this._records.length; }

    abstract get name(): string;
    abstract get description(): string;
    abstract get category(): string;

    tryLock(_locker: LockOpenListItem.Locker): Result<void> {
        // descendants can override
        return new Ok(undefined);
    }

    unlock(_locker: LockOpenListItem.Locker) {
        // descendants can override
    }

    openLocked(_opener: LockOpenListItem.Opener): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._sourceList !== undefined) {
            // cannot open more than once
            throw new AssertInternalError('RLIILIO31313');
        } else {
            this._sourceList = this.subscribeRankScoredLitIvemIdSourceList();

            const existingCount = this._sourceList.count;
            if (existingCount > 0) {
                this.insertRecords(0, existingCount);
            }

            this._sourceListCorrectnessChangeSubscriptionId = this._sourceList.subscribeCorrectnessChangedEvent(
                () => this.processDataItemCorrectnessChanged()
            );
            this._sourceListListChangeSubscriptionId = this._sourceList.subscribeListChangeEvent(
                (listChangeTypeId, index, count) => this.processDataItemListChange(listChangeTypeId, index, count)
            );
        }
    }

    closeLocked(_opener: LockOpenListItem.Opener): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._sourceList === undefined) {
            throw new AssertInternalError('RLIILIC31313');
        } else {
            this._sourceList.unsubscribeListChangeEvent(this._sourceListListChangeSubscriptionId);
            this._sourceListListChangeSubscriptionId = undefined;
            this._sourceList.unsubscribeCorrectnessChangedEvent(this._sourceListCorrectnessChangeSubscriptionId);
            this._sourceListCorrectnessChangeSubscriptionId = undefined;
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
        const correctnessId = this._sourceList.correctnessId;
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
                this.insertRecords(index, count);
                this.notifyListChange(listChangeTypeId, index, count);
                break;
            case UsableListChangeTypeId.Usable:
                // handled through badness change
                break;
            case UsableListChangeTypeId.Insert:
                this.insertRecords(index, count);
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, index, count);
                break;
            case UsableListChangeTypeId.BeforeReplace:
                this.checkUsableNotifyListChange(UsableListChangeTypeId.BeforeReplace, index, count);
                break;
            case UsableListChangeTypeId.AfterReplace:
                this.replaceRecords(index, count);
                this.checkUsableNotifyListChange(UsableListChangeTypeId.AfterReplace, index, count);
                break;
            case UsableListChangeTypeId.Remove:
                this.removeRecords(index, count);
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Remove, index, count);
                break;
            case UsableListChangeTypeId.Clear:
                this.checkUsableNotifyListChange(listChangeTypeId, index, count);
                this.clearRecords();
                break;
            default:
                throw new UnreachableCaseError('RLIILIPDILCD54483', listChangeTypeId);
        }
    }

    private insertRecords(index: Integer, insertCount: Integer) {
        if (insertCount > 0) {
            const toBeInsertedRecords = new Array<RankedLitIvemId>(insertCount);
            const scoredRecordList = this._sourceList;
            const correctnessId = this._sourceList.correctnessId;
            for (let i = 0; i < insertCount; i++) {
                const matchRecord = scoredRecordList.getAt(index + i);
                toBeInsertedRecords[i] = new RankedLitIvemId(matchRecord.litIvemId, correctnessId, -1, matchRecord.rankScore);
            }

            this._records.splice(index, 0, ...toBeInsertedRecords);
            this.insertIntoSorting(toBeInsertedRecords);
        }
    }

    private insertIntoSorting(insertRecords: RankedLitIvemId[]) {
        const insertCount = insertRecords.length;
        const existingCount = this.count;
        if (insertCount === 1) {
            this.insertOneIntoSorting(insertRecords[0]);
        } else {
            if (existingCount === 0 || insertCount >= 0.3 * existingCount) {
                this.insertIntoSortingWithResortAll(insertRecords);
            } else {
                this.insertIntoSortingIndividually(insertRecords);
            }
        }
    }

    private insertOneIntoSorting(record: RankedLitIvemId) {
        const sortedRecords = this._rankSortedRecords;
        const searchResult = anyBinarySearch(
            sortedRecords,
            record,
            (left, right) => compareNumber(left.rankScore, right.rankScore),
        );
        const insertIndex = searchResult.index;
        sortedRecords.splice(insertIndex, 0, record);
        this.reRank(insertIndex);
    }

    private insertIntoSortingWithResortAll(insertRecords: RankedLitIvemId[]) {
        const sortedRecords = this._rankSortedRecords;
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
        const sortedRecords = this._rankSortedRecords;
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
            sortedRecords.splice(insertIndex, 0, record);
            if (insertIndex < minSortInsertIndex) {
                minSortInsertIndex = insertIndex;
            }
            sortedRecordsCount += 1;
        }

        this.reRank(minSortInsertIndex);
    }

    private removeRecords(index: Integer, removeCount: Integer) {
        if (removeCount > 0) {
            const sortedRecords = this._rankSortedRecords;
            const sortedRecordsCount = sortedRecords.length;
            if (removeCount === sortedRecordsCount) {
                this.clearRecords();
            } else {
                this.removeRecordsFromSorting(index, removeCount);
                this._records.splice(index, removeCount);
            }
        }
    }

    private removeRecordsFromSorting(index: Integer, removeCount: Integer) {
        const sortedRecords = this._rankSortedRecords;
        if (removeCount === 1) {
            const removeRecord = this._records[index];
            const removeRank = removeRecord.rank;
            const removeRankSortedIndex = removeRank - 1;
            sortedRecords.splice(removeRankSortedIndex, 1);
            this.reRank(removeRankSortedIndex);
        } else {
            const nextRangeIndex = index + removeCount;
            for (let i = index; i < nextRangeIndex; i++) {
                const rankedLitIvemId = this._records[i];
                rankedLitIvemId.setInvalidRank();
            }

            sortedRecords.sort((left, right) => compareNumber(left.rank, right.rank));

            const sortedRecordsCount = sortedRecords.length;
            for (let i = 0; i < sortedRecordsCount; i++) {
                const rankedLitIvemId = sortedRecords[i];
                if (!rankedLitIvemId.isRankInvalid()) {
                    sortedRecords.splice(0, i);
                    break;
                }
            }
            this.reRank(0);
        }
    }

    private replaceRecords(index: Integer, replaceCount: Integer) {
        if (replaceCount > 0) {
            this.removeRecordsFromSorting(index, replaceCount);

            const newRecords = new Array<RankedLitIvemId>(replaceCount);
            const scoredRecordList = this._sourceList;
            const correctnessId = this._sourceList.correctnessId;
            for (let i = 0; i < replaceCount; i++) {
                const scoredRecord = scoredRecordList.getAt(index + i);
                const newRecord = new RankedLitIvemId(scoredRecord.litIvemId, correctnessId, -1, scoredRecord.rankScore);
                this._records[index + i] = newRecord;
                newRecords[i] = newRecord;
            }

            this.insertIntoSorting(newRecords);
        }
    }

    private clearRecords() {
        this._records.length = 0;
        this._rankSortedRecords.length = 0;
    }

    private reRank(startIndex: Integer) {
        const sortedRecords = this._rankSortedRecords;
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

export namespace ScoredRankedLitIvemIdList {
    export type ModifiedEventer = (this: void) => void;
}
