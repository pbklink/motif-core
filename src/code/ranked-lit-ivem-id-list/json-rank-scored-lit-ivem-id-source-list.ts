/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../adi/adi-internal-api';
import { Badness } from '../sys/badness';
import { BadnessList } from '../sys/badness-list';
import { CorrectnessId } from '../sys/correctness';
import { CorrectnessRecord } from '../sys/correctness-record';
import { MultiEvent } from '../sys/multi-event';
import { RecordList } from '../sys/record-list';
import { Integer, UsableListChangeTypeId } from '../sys/sys-internal-api';
import { JsonRankedLitIvemIdListDefinition } from './definition/ranked-lit-ivem-id-list-definition-internal-api';
import { RankScoredLitIvemIdSourceList } from './rank-scored-lit-ivem-id-source-list';
import { RankScoredLitIvemIdSourceListItem } from './rank-scored-lit-ivem-id-source-list-item';

export class ExplicitRankScoredLitIvemIdSourceList implements RankScoredLitIvemIdSourceList {
    private readonly _litIvemIds = new Array<LitIvemId>();

    readonly userCanAdd = true;
    readonly userCanRemove = true;
    readonly userCanMove = true;
    readonly badness = Badness.notBad;
    readonly correctnessId = CorrectnessId.Good;
    readonly usable = true;

    private _listChangeMultiEvent = new MultiEvent<RecordList.ListChangeEventHandler>();

    get litIvemIds(): readonly LitIvemId[] { return this._litIvemIds; }
    get count() { return this._litIvemIds.length; }

    constructor(
        definition: JsonRankedLitIvemIdListDefinition,
        private readonly _modifiedEventHandler: ExplicitRankScoredLitIvemIdSourceList.ModifiedEventHandler | undefined,
    ) {
        const definitionLitIvemIds = definition.litIvemIds;
        const count = definitionLitIvemIds.length;
        const litIvemIds = new Array<LitIvemId>(count);
        for (let i = 0; i < count; i++) {
            const definitionLitIvemId = definitionLitIvemIds[i];
            const litIvemId = definitionLitIvemId.createCopy();
            litIvemIds[i] = litIvemId;
        }
        this._litIvemIds = litIvemIds;
    }

    indexOf(record: RankScoredLitIvemIdSourceListItem) {
        return record.rankScore; // assumes in same list
        // const count = this.count;
        // const litIvemId = record.litIvemId;
        // for (let index = 0; index < count; index++) {
        //     if (this._litIvemIds[index] === litIvemId) {
        //         return index;
        //     }
        // }
        // return -1;
    }

    getAt(index: number): RankScoredLitIvemIdSourceListItem {
        return {
            litIvemId: this._litIvemIds[index],
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
