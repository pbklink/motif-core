/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId, RankScoredLitIvemId, RankScoredLitIvemIdList } from '../adi/adi-internal-api';
import { Badness } from '../sys/badness';
import { BadnessList } from '../sys/badness-list';
import { CorrectnessId } from '../sys/correctness';
import { CorrectnessRecord } from '../sys/correctness-record';
import { MultiEvent } from '../sys/multi-event';
import { RecordList } from '../sys/record-list';
import { Integer, UsableListChangeTypeId } from '../sys/sys-internal-api';

export class IndexRankScoredLitIvemIdSourceList implements RankScoredLitIvemIdList {
    readonly userCanAdd = true;
    readonly userCanRemove = true;
    readonly userCanMove = true;
    readonly badness = Badness.notBad;
    readonly correctnessId = CorrectnessId.Good;
    readonly usable = true;

    private readonly _litIvemIds = new Array<LitIvemId>();

    private _listChangeMultiEvent = new MultiEvent<RecordList.ListChangeEventHandler>();

    constructor(
        initialLitIvemIds: readonly LitIvemId[],
        private readonly _modifiedEventHandler: ExplicitRankScoredLitIvemIdSourceList.ModifiedEventHandler | undefined,
    ) {
        const count = initialLitIvemIds.length;
        const litIvemIds = new Array<LitIvemId>(count);
        for (let i = 0; i < count; i++) {
            const definitionLitIvemId = initialLitIvemIds[i];
            const litIvemId = definitionLitIvemId.createCopy();
            litIvemIds[i] = litIvemId;
        }
        this._litIvemIds = litIvemIds;
    }

    get litIvemIds(): readonly LitIvemId[] { return this._litIvemIds; }
    get count() { return this._litIvemIds.length; }

    indexOf(record: RankScoredLitIvemId) {
        return record.rankScore; // assumes in same list
    }

    getAt(index: number): RankScoredLitIvemId {
        return {
            value: this._litIvemIds[index],
            rankScore: index,
        };
    }

    set(value: LitIvemId[]) {
        const existingCount = this._litIvemIds.length;
        if (existingCount > 0) {
            this.notifyListChange(UsableListChangeTypeId.Clear, 0, existingCount);
            this._litIvemIds.length = 0;
        }
        this.addArray(value);
    }

    add(value: LitIvemId) {
        const newCount = this._litIvemIds.push(value);
        const index = newCount - 1;
        this.notifyListChange(UsableListChangeTypeId.Insert, index, 1);
        this.notifyModified();
        return index;
    }

    addArray(value: LitIvemId[]) {
        const index = this._litIvemIds.length;
        this._litIvemIds.splice(index, 0, ...value);
        this.notifyListChange(UsableListChangeTypeId.Insert, index, value.length);
        this.notifyModified();
    }

    replaceAt(index: number, litIvemIds: LitIvemId[]) {
        const count = this._litIvemIds.length;
        this.notifyListChange(UsableListChangeTypeId.BeforeReplace, index, count);
        this._litIvemIds.splice(index, count, ...litIvemIds);
        this.notifyListChange(UsableListChangeTypeId.AfterReplace, index, count);
        this.notifyModified();
    }

    removeAt(index: number, count: number): void {
        this._litIvemIds.splice(index, count);
        this.notifyListChange(UsableListChangeTypeId.Remove, index, count);
        this.notifyModified();
    }

    subscribeBadnessChangeEvent(_handler: BadnessList.BadnessChangeEventHandler) {
        return MultiEvent.nullDefinedSubscriptionId;
    }

    unsubscribeBadnessChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void {
        // nothing to do
    }

    subscribeCorrectnessChangedEvent(handler: CorrectnessRecord.CorrectnessChangedEventHandler): number {
        return MultiEvent.nullDefinedSubscriptionId;
    }

    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void {
        // nothing to do
    }

    subscribeListChangeEvent(handler: RecordList.ListChangeEventHandler): number {
        return this._listChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void {
        this._listChangeMultiEvent.unsubscribe(subscriptionId);
    }

    private notifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        const handlers = this._listChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, index, count);
        }
    }

    private notifyModified() {
        if (this._modifiedEventHandler !== undefined) {
            this._modifiedEventHandler();
        }
    }
}

export namespace ExplicitRankScoredLitIvemIdSourceList {
    export type ModifiedEventHandler = (this: void) => void;
}
