/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ChangeSubscribableComparableList, Integer, MultiEvent, RecordList, UnreachableCaseError, UsableListChangeTypeId } from '../../sys/sys-internal-api';
import { DataDefinition, DataMessage, DataMessageTypeId, LitIvemId, LitIvemIdMatchesDataMessage, MarketInfo } from '../common/adi-common-internal-api';
import { RankScoredLitIvemId, RankScoredLitIvemIdList } from '../rank-scored-lit-ivem-id/internal-api';
import { LitIvemIdScanMatch } from './lit-ivem-id-scan-match';
import { ScanMatch } from './scan-match';
import { ScanMatchesDataItem } from './scan-matches-data-item';

export class LitIvemIdScanMatchesDataItem extends ScanMatchesDataItem<LitIvemId> implements RankScoredLitIvemIdList {
    readonly rankedMatches: ChangeSubscribableComparableList<LitIvemIdScanMatch>;

    private _rankedMatchesListChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _rankedListChangeMultiEvent = new MultiEvent<RecordList.ListChangeEventHandler>();
    private _searchMatch: LitIvemIdScanMatch = {
        index: -1,
        rankScore: 0, // only rank score used for searching
        value: new LitIvemId(LitIvemId.nullCode, MarketInfo.nullId),
    }

    constructor(definition: DataDefinition) {
        super(definition);
        this.rankedMatches = new ChangeSubscribableComparableList<LitIvemIdScanMatch>((left, right) => this.compareRankScore(left, right));
    }

    get count() { return this.rankedMatches.count; }

    override start() {
        this._rankedMatchesListChangeSubscriptionId = this.rankedMatches.subscribeListChangeEvent(
            (listChangeTypeId, idx, count) => { this.processRankedMatchesListChange(listChangeTypeId, idx, count); }
        );
        super.start();
    }

    override stop() {
        super.stop();

        this.rankedMatches.unsubscribeListChangeEvent(this._rankedMatchesListChangeSubscriptionId);
        this._rankedMatchesListChangeSubscriptionId = undefined;
    }

    indexOf(value: LitIvemIdScanMatch) {
        const rankedMatches = this.rankedMatches;
        const count = rankedMatches.count;
        for (let i = 0; i < count; i++) {
            const match = rankedMatches.getAt(i);
            if (match === value) { // this may need to check if same by value (not reference)
                return i;
            }
        }
        return -1;
    }

    getAt(index: Integer) {
        return this.rankedMatches.getAt(index);
    }

    toArray(): readonly RankScoredLitIvemId[] {
        return this.rankedMatches.toArray();
    }

    override processMessage(msg: DataMessage) {
        if (msg.typeId !== DataMessageTypeId.LitIvemIdMatches) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                this.notifyUpdateChange();
                const matchesMsg = msg as LitIvemIdMatchesDataMessage;
                this.processChanges(matchesMsg.changes);
            } finally {
                this.endUpdate();
            }
        }
    }

    createMatch(unrankedIndex: Integer, value: LitIvemId, rankScore: number) {
        const match = new LitIvemIdScanMatchesDataItem.LitIvemIdMatch(
            unrankedIndex,
            -1,
            value,
            rankScore,
            (thisMatch, newRankScore) => { this.handleUpdateMatchRankScoreEvent(thisMatch, newRankScore) },
        );
        return match;
    }

    override subscribeListChangeEvent(handler: RecordList.ListChangeEventHandler) {
        return this._rankedListChangeMultiEvent.subscribe(handler);
    }

    override unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._rankedListChangeMultiEvent.unsubscribe(subscriptionId);
    }

    protected override processUsableChanged() {
        super.processUsableChanged();

        if (this.usable) {
            this.notifyListChange(UsableListChangeTypeId.PreUsableClear, 0, 0);
            const count = this.count;
            if (count > 0) {
                this.notifyListChange(UsableListChangeTypeId.PreUsableAdd, 0, count);
            }
            this.notifyListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.notifyListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }

    protected override rankUnrankedListAdd(addIndex: Integer, addCount: Integer) {
        if (addIndex === 0) {
            this.rankedMatches.addRange(this.unrankedRecords);
            this.rankedMatches.sort();
        } else {
            this.rankedMatches.setMinimumCapacity(this.unrankedRecords.length + addCount);
            const afterAddRangeIndex = addIndex + addCount;
            let sequentialInsertStartIndex = -1;
            let sequentialInsertCount = 0;
            const sequentialInsertMatches = new Array<LitIvemIdScanMatch>(addCount);
            for (let i = addIndex; i < afterAddRangeIndex; i++) {
                const match = this.unrankedRecords[i];
                const searchResult = this.rankedMatches.binarySearchEarliest(match);
                const insertIndex = searchResult.index;
                match.index = insertIndex;
                if (sequentialInsertCount === 0) {
                    sequentialInsertStartIndex = insertIndex;
                    sequentialInsertMatches[sequentialInsertCount++] = match;
                } else {
                    if (insertIndex === sequentialInsertStartIndex + sequentialInsertCount) {
                        sequentialInsertMatches[sequentialInsertCount++] = match;
                    } else {
                        this.rankedMatches.insertSubRange(sequentialInsertStartIndex, sequentialInsertMatches, 0, sequentialInsertCount);
                        this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, sequentialInsertStartIndex, sequentialInsertCount);
                        sequentialInsertStartIndex = insertIndex;
                        sequentialInsertCount = 1;
                        sequentialInsertMatches[0] = match;
                    }
                }
            }
            if (sequentialInsertCount > 0) {
                this.rankedMatches.insertSubRange(sequentialInsertStartIndex, sequentialInsertMatches, 0, sequentialInsertCount);
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, sequentialInsertStartIndex, sequentialInsertCount);
            }
        }
    }

    protected override rankUnrankedListRemove(removeIndex: Integer) {
        this.checkUsableNotifyListChange(UsableListChangeTypeId.Remove, removeIndex, 1);
        this.rankedMatches.removeAtIndex(removeIndex);
    }

    protected override rankUnrankedListClear() {
        const count =  this.rankedMatches.count;
        this.notifyListChange(UsableListChangeTypeId.Clear, 0, count);
        this.rankedMatches.clear();
    }

    private handleUpdateMatchRankScoreEvent(match: LitIvemIdScanMatchesDataItem.LitIvemIdMatch, newRankScore: number) {
        const searchMatch = this._searchMatch;
        searchMatch.rankScore = newRankScore;
        const searchResult = this.rankedMatches.binarySearchEarliest(searchMatch);
        const insertIndex = searchResult.index;
        match.setRankScore(newRankScore); // make sure this is set after searching otherwise sort order may be wrong
        if (insertIndex !== match.index) {
            this.rankedMatches.move(match.index, insertIndex);
        }
    }

    private processRankedMatchesListChange(listChangeTypeId: UsableListChangeTypeId, idx: Integer, changeCount: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                throw new AssertInternalError('LIISMDIPRMLCUU41423'); // Never occurs.  Unusable is handled through badness change
                break;
            case UsableListChangeTypeId.PreUsableClear:
                throw new AssertInternalError('LIISMDIPRMLCPC41423'); // Never occurs.
            case UsableListChangeTypeId.PreUsableAdd:
                throw new AssertInternalError('LIISMDIPRMLCPA41423'); // Never occurs.
            case UsableListChangeTypeId.Usable: {
                throw new AssertInternalError('LIISMDIPRMLCU41423'); // Never occurs.
            }
            case UsableListChangeTypeId.Insert:
                this.checkUsableNotifyListChange(listChangeTypeId, idx, changeCount);
                break;
            case UsableListChangeTypeId.BeforeReplace:
                this.checkUsableNotifyListChange(listChangeTypeId, idx, changeCount);
                break;
            case UsableListChangeTypeId.AfterReplace: {
                this.checkUsableNotifyListChange(listChangeTypeId, idx, changeCount);
                break;
            }
            case UsableListChangeTypeId.BeforeMove:
                this.checkUsableNotifyListChange(listChangeTypeId, idx, changeCount);
                break;
            case UsableListChangeTypeId.AfterMove: {
                this.checkUsableNotifyListChange(listChangeTypeId, idx, changeCount);
                break;
            }
            case UsableListChangeTypeId.Remove:
                this.checkUsableNotifyListChange(listChangeTypeId, idx, changeCount);
                break;
            case UsableListChangeTypeId.Clear:
                this.notifyListChange(UsableListChangeTypeId.Clear, idx, changeCount);
                break;
            default:
                throw new UnreachableCaseError('LIISMDIPRMLCU41423', listChangeTypeId);
        }
    }

    private checkUsableNotifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        if (this.usable) {
            this.notifyListChange(listChangeTypeId, index, count);
        }
    }

    private notifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        const handlers = this._rankedListChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, index, count);
        }
    }
}

export namespace LitIvemIdScanMatchesDataItem {
    export class LitIvemIdMatch extends ScanMatchesDataItem.Match<LitIvemId> {
        update(value: LitIvemId, rankScore: number) {
            const changedFields = new Array<ScanMatchesDataItem.Match.ChangeableField>(2);
            let changeCount = 0;
            if (!LitIvemId.isEqual(value, this.value)) {
                this.setValue(value);
                changedFields[changeCount++] = ScanMatch.FieldId.Value;
            }

            if (rankScore !== this.rankScore) {
                this.updateRankScoreEventer(this, rankScore);
                changedFields[changeCount++] = ScanMatch.FieldId.RankScore;
            }

            if (changeCount < 2) {
                changedFields.length = changeCount;
            }

            this.notifyUpdated(changedFields);
        }
    }
}
