/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../adi/adi-internal-api';
import {
    Badness,
    BadnessList,
    CorrectnessId,
    CorrectnessRecord,
    Integer,
    LockOpenListItem,
    MultiEvent,
    Ok,
    RecordList,
    Result,
    UsableListChangeTypeId
} from "../sys/sys-internal-api";
import {
    ExplicitRankedLitIvemIdListDefinition
} from "./definition/ranked-lit-ivem-id-list-definition-internal-api";
import { RankedLitIvemId } from './ranked-lit-ivem-id';
import { RankedLitIvemIdList } from './ranked-lit-ivem-id-list';

export class ExplicitRankedLitIvemIdList implements RankedLitIvemIdList {
    readonly userCanAdd = true;
    readonly userCanRemove = true;
    readonly userCanMove = true;
    readonly badness = Badness.notBad;
    readonly correctnessId = CorrectnessId.Good;
    readonly usable = true;
    readonly mapKey = '' // never used

    index: number;

    private _listChangeMultiEvent = new MultiEvent<RecordList.ListChangeEventHandler>();

    get count() { return this.definition.litIvemIds.length; }

    constructor(readonly definition: ExplicitRankedLitIvemIdListDefinition) {

    }

    getAt(index: number): RankedLitIvemId {
        return {
            litIvemId: this.definition.litIvemIds[index],
            rank: index + 1,
            rankKey: index,
        };
    }

    userAdd(litIvemId: LitIvemId): void {
        const index = this.count;
        const newLitIvemIds = [...this.definition.litIvemIds, litIvemId];
        this.definition.setLitIvemIds(newLitIvemIds);
        this.notifyListChange(UsableListChangeTypeId.Insert, index, 1);
    }

    userAddArray(litIvemIds: LitIvemId[]): void {
        const index = this.count;
        const newLitIvemIds = [...this.definition.litIvemIds, ...litIvemIds];
        this.definition.setLitIvemIds(newLitIvemIds);
        this.notifyListChange(UsableListChangeTypeId.Insert, index, litIvemIds.length);
    }

    userRemoveAt(index: number, count: number): void {
        this.notifyListChange(UsableListChangeTypeId.Remove, index, count);
        const newLitIvemIds = this.definition.litIvemIds.slice();
        newLitIvemIds.splice(index, count);
        this.definition.setLitIvemIds(newLitIvemIds);
    }

    userMoveAt(fromIndex: number, count: number, toIndex: number): void {
        throw new Error('Method not implemented.');
    }

    openLocked(_opener: LockOpenListItem.Opener): void {
        // nothing to do
    }

    closeLocked(_opener: LockOpenListItem.Opener): void {
        // nothing to do
    }

    tryProcessFirstLock(_locker: LockOpenListItem.Locker): Result<void> {
        return new Ok(undefined);
    }

    processLastUnlock(_locker: LockOpenListItem.Locker): void {
        // nothing to do
    }

    tryProcessFirstOpen(_opener: LockOpenListItem.Opener): Result<void> {
        return new Ok(undefined);
    }

    processLastClose(_opener: LockOpenListItem.Opener): void {
        // nothing to do
    }

    equals(other: LockOpenListItem): boolean {
        return other.mapKey === this.mapKey;
    }

    subscribeBadnessChangeEvent(_handler: BadnessList.BadnessChangeEventHandler) {
        return 0;
    }

    unsubscribeBadnessChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void {
        // nothing to do
    }

    subscribeListChangeEvent(handler: RecordList.ListChangeEventHandler): number {
        return this._listChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void {
        this._listChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeCorrectnessChangedEvent(_handler: CorrectnessRecord.CorrectnessChangedEventHandler): number {
        return 0;
    }

    unsubscribeCorrectnessChangedEvent(_subscriptionId: MultiEvent.SubscriptionId): void {
        // nothing to do
    }

    private notifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        const handlers = this._listChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, index, count);
        }
    }
}
