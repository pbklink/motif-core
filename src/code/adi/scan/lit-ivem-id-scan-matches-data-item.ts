/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BadnessList, ComparableList, Integer, MultiEvent, RecordList, UsableListChangeTypeId } from '../../sys/sys-internal-api';
import { DataDefinition, DataMessage, DataMessageTypeId, LitIvemId, LitIvemIdMatchesDataMessage, MarketInfo } from '../common/adi-common-internal-api';
import { ScanMatch } from './scan-match';
import { ScanMatchesDataItem } from './scan-matches-data-item';

export class LitIvemIdScanMatchesDataItem extends ScanMatchesDataItem<LitIvemId> implements BadnessList<ScanMatch<LitIvemId>> {
    private readonly _rankedMatches: ComparableList<ScanMatch<LitIvemId>>;

    private _rankedListChangeMultiEvent = new MultiEvent<RecordList.ListChangeEventHandler>();
    private _searchMatch: ScanMatch<LitIvemId> = {
        index: -1,
        rankScore: 0, // only rank score used for searching
        value: new LitIvemId(LitIvemId.nullCode, MarketInfo.nullId),
    }

    constructor(definition: DataDefinition) {
        super(definition);
        this._rankedMatches = new ComparableList<ScanMatch<LitIvemId>>((left, right) => this.compareRankScore(left, right));
    }

    get count() { return this.unrankedRecords.length; }

    indexOf(value: ScanMatch<LitIvemId>) {
        const rankedMatches = this._rankedMatches;
        const count = rankedMatches.count;
        for (let i = 0; i < count; i++) {
            const match = rankedMatches.getItem(i);
            if (match === value) { // this may need to check if same by value (not reference)
                return i;
            }
        }
        return -1;
    }

    getAt(index: Integer) {
        return this._rankedMatches.getItem(index);
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

    protected override rankUnrankedListAdd(addIndex: Integer, addCount: Integer) {
        if (addIndex === 0) {
            this._rankedMatches.addRange(this.unrankedRecords);
            this._rankedMatches.sort();
        } else {
            this._rankedMatches.setMinimumCapacity(this.unrankedRecords.length + addCount);
            const afterAddRangeIndex = addIndex + addCount;
            let sequentialInsertStartIndex = -1;
            let sequentialInsertCount = 0;
            const sequentialInsertMatches = new Array<ScanMatch<LitIvemId>>(addCount);
            for (let i = addIndex; i < afterAddRangeIndex; i++) {
                const match = this.unrankedRecords[i];
                const searchResult = this._rankedMatches.binarySearchEarliest(match);
                const insertIndex = searchResult.index;
                match.index = insertIndex;
                if (sequentialInsertCount === 0) {
                    sequentialInsertStartIndex = insertIndex;
                    sequentialInsertMatches[sequentialInsertCount++] = match;
                } else {
                    if (insertIndex === sequentialInsertStartIndex + sequentialInsertCount) {
                        sequentialInsertMatches[sequentialInsertCount++] = match;
                    } else {
                        this._rankedMatches.insertSubRange(sequentialInsertStartIndex, sequentialInsertMatches, 0, sequentialInsertCount);
                        this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, sequentialInsertStartIndex, sequentialInsertCount);
                        sequentialInsertStartIndex = insertIndex;
                        sequentialInsertCount = 1;
                        sequentialInsertMatches[0] = match;
                    }
                }
            }
            if (sequentialInsertCount > 0) {
                this._rankedMatches.insertSubRange(sequentialInsertStartIndex, sequentialInsertMatches, 0, sequentialInsertCount);
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, sequentialInsertStartIndex, sequentialInsertCount);
            }
        }
    }

    protected override rankUnrankedListRemove(removeIndex: Integer) {
        this.checkUsableNotifyListChange(UsableListChangeTypeId.Remove, removeIndex, 1);
        this._rankedMatches.removeAtIndex(removeIndex);
    }

    protected override rankUnrankedListClear() {
        const count =  this._rankedMatches.count;
        this.notifyListChange(UsableListChangeTypeId.Clear, 0, count);
        this._rankedMatches.clear();
    }

    private handleUpdateMatchRankScoreEvent(match: LitIvemIdScanMatchesDataItem.LitIvemIdMatch, newRankScore: number) {
        const searchMatch = this._searchMatch;
        searchMatch.rankScore = newRankScore;
        const searchResult = this._rankedMatches.binarySearchEarliest(searchMatch);
        const insertIndex = searchResult.index;
        match.setRankScore(newRankScore); // make sure this is set after searching otherwise sort order may be wrong
        if (insertIndex !== match.index) {
            this._rankedMatches.move(match.index, insertIndex);
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
