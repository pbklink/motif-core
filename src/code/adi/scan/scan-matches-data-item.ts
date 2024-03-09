/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    ErrorCode,
    Integer,
    MultiEvent,
    PickEnum,
    RecordList,
    UnreachableCaseError,
    UsableListChangeTypeId,
    ZenithDataError
} from '../../sys/internal-api';
import {
    AurcChangeTypeId,
    DataDefinition,
    FeedId,
    LitIvemIdMatchesDataMessage,
    MatchesDataMessage,
} from '../common/adi-common-internal-api';
import { FeedSubscriptionDataItem } from '../feed/internal-api';
import { ScanMatch } from './scan-match';

export abstract class ScanMatchesDataItem<T> extends FeedSubscriptionDataItem {
    readonly unrankedRecords = new Array<ScanMatchesDataItem.Match<T>>();
    private readonly _unrankedRecordMap = new Map<string, ScanMatchesDataItem.Match<T>>();

    private _unrankedListChangeMultiEvent = new MultiEvent<RecordList.ListChangeEventHandler>();

    constructor(definition: DataDefinition) {
        super(definition)
        this.setFeedId(FeedId.Scanner);
    }

    subscribeListChangeEvent(handler: RecordList.ListChangeEventHandler) {
        return this._unrankedListChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._unrankedListChangeMultiEvent.unsubscribe(subscriptionId);
    }

    protected override processSubscriptionPreOnline() {
        this.clearRecords();
    }

    protected override processUsableChanged() {
        if (this.usable) {
            this.notifyUnrankedListChange(UsableListChangeTypeId.PreUsableClear, 0, 0);
            const count = this.unrankedRecords.length;
            if (count > 0) {
                this.notifyUnrankedListChange(UsableListChangeTypeId.PreUsableAdd, 0, count);
            }
            this.notifyUnrankedListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.notifyUnrankedListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }

    protected processChanges(changes: MatchesDataMessage.Change<T>[]): void {
        let addStartMsgIdx = -1;

        const msgRecordLength = changes.length;
        for (let msgChangeIdx = 0; msgChangeIdx < msgRecordLength; msgChangeIdx++) {
            const change = changes[msgChangeIdx];
            switch (change.typeId) {
                case AurcChangeTypeId.Add: {
                    const addChange = change as MatchesDataMessage.AddUpdateChange<T>;
                    const mapKey = addChange.key;
                    if (this._unrankedRecordMap.has(mapKey)) {
                        throw new ZenithDataError(ErrorCode.MatchesDataItem_AddChangeKeyAlreadyExists, `${mapKey}`);
                    } else {
                        if (addStartMsgIdx < 0) {
                            addStartMsgIdx = msgChangeIdx;
                        }
                    }
                    break;
                }

                case AurcChangeTypeId.Update: {
                    addStartMsgIdx = this.checkApplyAdd(changes, addStartMsgIdx, msgChangeIdx);
                    const updateChange = change as MatchesDataMessage.AddUpdateChange<T>;
                    const mapKey = updateChange.key;
                    const matchRecord = this._unrankedRecordMap.get(mapKey);

                    if (matchRecord === undefined) {
                        throw new ZenithDataError(ErrorCode.MatchesDataItem_UpdateChangeKeyDoesNotExists, `${mapKey}`);
                    } else {
                        matchRecord.update(updateChange.value, updateChange.rankScore);
                    }
                    break;
                }

                case AurcChangeTypeId.Remove: {
                    addStartMsgIdx = this.checkApplyAdd(changes, addStartMsgIdx, msgChangeIdx);
                    const removeChange = change as MatchesDataMessage.RemoveChange<T>;
                    const mapKey = removeChange.key;
                    const matchRecord = this._unrankedRecordMap.get(mapKey);
                    if (matchRecord === undefined) {
                        throw new ZenithDataError(ErrorCode.MatchesDataItem_RemoveChangeKeyDoesNotExists, `${mapKey}`);
                    } else {
                        this.checkUnrankedUsableNotifyListChange(UsableListChangeTypeId.Remove, matchRecord.unrankedIndex, 1);
                        this.removeRecord(matchRecord);
                    }
                    break;
                }

                case AurcChangeTypeId.Clear:
                    addStartMsgIdx = this.checkApplyAdd(changes, addStartMsgIdx, msgChangeIdx);
                    this.clearRecords();
                    break;

                default:
                    throw new UnreachableCaseError('MDIPC10091', change.typeId);
            }
        }
        this.checkApplyAdd(changes, addStartMsgIdx, changes.length);
    }

    protected compareRankScore(left: ScanMatch<T>, right: ScanMatch<T>) {
        return left.rankScore - right.rankScore;
    }

    private checkApplyAdd(changes: readonly MatchesDataMessage.Change<T>[], addStartMsgIdx: Integer, endPlus1MsgIdx: Integer) {
        if (addStartMsgIdx >= 0) {
            const addCount = endPlus1MsgIdx - addStartMsgIdx;
            const addStartIdx = this.unrankedRecords.length;
            this.unrankedRecords.length = addStartIdx +addCount;
            let addIdx = addStartIdx;
            for (let i = addStartMsgIdx; i < endPlus1MsgIdx; i++) {
                const change = changes[i];
                if (!LitIvemIdMatchesDataMessage.isAddUpdateChange(change)) {
                    throw new AssertInternalError('MDICAD10091');
                } else {

                    const match = this.createMatch(addIdx, change.value, change.rankScore);
                    this.unrankedRecords[addIdx] = match;
                    addIdx++;
                }
            }
            this.checkUnrankedUsableNotifyListChange(UsableListChangeTypeId.Insert, addStartIdx, addCount);
            this.rankUnrankedListAdd(addStartIdx, addCount);
        }

        return -1;
    }

    private clearRecords() {
        const count = this.unrankedRecords.length;
        if (count > 0) {
            this.notifyUnrankedListChange(UsableListChangeTypeId.Clear, 0, count);
            this.unrankedRecords.length = 0;
            this._unrankedRecordMap.clear();
        }
        this.rankUnrankedListClear();
    }

    private removeRecord(matchRecord: ScanMatchesDataItem.Match<T>) {
        const idx = matchRecord.unrankedIndex;
        this.checkUnrankedUsableNotifyListChange(UsableListChangeTypeId.Remove, idx, 1);
        this.unrankedRecords.splice(idx, 1);
        this.reindexUnranked(idx);
        this.rankUnrankedListRemove(idx);
    }

    private reindexUnranked(fromIndex: Integer) {
        const count = this.unrankedRecords.length;
        for (let i = fromIndex; i < count; i++) {
            this.unrankedRecords[i].unrankedIndex = i;
        }
    }

    private checkUnrankedUsableNotifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        if (this.usable) {
            this.notifyUnrankedListChange(listChangeTypeId, index, count);
        }
    }

    private notifyUnrankedListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        const handlers = this._unrankedListChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, index, count);
        }
    }

    abstract createMatch(unrankedIndex: Integer, value: T, rankScore: number): ScanMatchesDataItem.Match<T>;

    protected abstract rankUnrankedListAdd(addIndex: Integer, addCount: Integer): void;
    protected abstract rankUnrankedListRemove(removeIndex: Integer): void;
    protected abstract rankUnrankedListClear(): void;
}

export namespace ScanMatchesDataItem {
    export abstract class Match<T> implements ScanMatch<T> {
        private _value: T;
        private _rankScore: number;

        constructor(
            public unrankedIndex: Integer,
            public index: Integer,
            value: T,
            rankScore: number,
            public readonly updateRankScoreEventer: Match.UpdateRankScoreEventer<T>,
        ) {
            this._value = value;
            this._rankScore = rankScore;
        }

        get value() { return this._value; }
        get rankScore() { return this._rankScore; }

        setValue(newValue: T) {
            this._value = newValue;
        }
        setRankScore(newRankScore: number) {
            this._rankScore = newRankScore;
        }

        protected notifyUpdated(changedFields: readonly Match.ChangeableField[]) {
            // TODO
        }

        abstract update(value: T, rankScore: number): void;
    }

    export namespace Match {
        export type ChangeableField = PickEnum<ScanMatch.FieldId,
            ScanMatch.FieldId.Value |
            ScanMatch.FieldId.RankScore
        >;

        export type UpdatedEventer = (this: void, changedFields: readonly Match.ChangeableField[]) => void;
        export type UpdateRankScoreEventer<T> = (this: void, thisMatch: Match<T>, newRankScore: number) => void;
    }
}
