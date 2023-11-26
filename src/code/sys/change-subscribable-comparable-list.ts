/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ComparableList } from './comparable-list';
import { Correctness, CorrectnessId } from './correctness';
import { CorrectnessList } from './correctness-list';
import { AssertInternalError } from './internal-error';
import { MultiEvent } from './multi-event';
import { RecordList } from './record-list';
import { Integer, UsableListChangeTypeId } from './types';

export class ChangeSubscribableComparableList<T> extends ComparableList<T> implements CorrectnessList<T> {
    private _correctnessId = CorrectnessId.Good;
    private _listChangeMultiEvent = new MultiEvent<RecordList.ListChangeEventHandler>();
    private _correctnessChangedMultiEvent = new MultiEvent<CorrectnessList.CorrectnessChangedEventHandler>();

    get usable() { return Correctness.idIsUsable(this._correctnessId); }
    get correctnessId() { return this._correctnessId; }
    set correctnessId(value: CorrectnessId) {
        if (value !== this._correctnessId) {
            const oldUsable = this.usable;
            this._correctnessId = value;

            const usable = this.usable;
            if (usable !== oldUsable) {
                if (!usable) {
                    this.notifyListChange(UsableListChangeTypeId.Unusable, 0, 0);
                } else {
                    this.notifyListChange(UsableListChangeTypeId.PreUsableClear, 0, 0);
                    const count = this.count;
                    if (this.count > 0) {
                        this.notifyListChange(UsableListChangeTypeId.PreUsableAdd, 0, count)
                    }
                    this.notifyListChange(UsableListChangeTypeId.Usable, 0, count);
                }
            }

            this.notifyCorrectnessChanged();
        }
    }

    override clone(): ChangeSubscribableComparableList<T> {
        const result = new ChangeSubscribableComparableList(this._compareItemsFtn);
        result.assign(this);
        return result;
    }

    override setAt(index: Integer, value: T) {
        this.notifyListChange(UsableListChangeTypeId.BeforeReplace, index, 1);
        super.setAt(index, value);
        this.notifyListChange(UsableListChangeTypeId.AfterReplace, index, 1);
    }

    override add(value: T) {
        const firstAddIndex = this.count;
        const result = super.add(value);
        this.notifyListChange(UsableListChangeTypeId.Insert, firstAddIndex, 1);
        return result;
    }

    override addRange(values: T[]) {
        const firstAddIndex = this.count;
        super.addRange(values);
        this.notifyListChange(UsableListChangeTypeId.Insert, firstAddIndex, values.length);
    }

    override addSubRange(values: T[], rangeStartIndex: Integer, rangeCount: Integer) {
        const firstAddIndex = this.count;
        super.addSubRange(values, rangeStartIndex, rangeCount);
        this.notifyListChange(UsableListChangeTypeId.Insert, firstAddIndex, rangeCount);
    }

    override insert(index: Integer, value: T) {
        super.insert(index, value);
        this.notifyListChange(UsableListChangeTypeId.Insert, index, 1);
    }

    override insertRange(index: Integer, values: T[]) {
        super.insertRange(index, values);
        this.notifyListChange(UsableListChangeTypeId.Insert, index, values.length);
    }

    override remove(value: T) {
        const idx = this.indexOf(value);
        if (idx < 0) {
            throw new AssertInternalError('CSMCLR40401', `${JSON.stringify(value)}`);
        } else {
            this.notifyListChange(UsableListChangeTypeId.Remove, idx, 1);
            super.removeAtIndex(idx);
        }
    }

    override removeAtIndex(index: Integer) {
        this.notifyListChange(UsableListChangeTypeId.Remove, index, 1);
        super.removeAtIndex(index);
    }

    override removeRange(index: Integer, deleteCount: Integer) {
        this.notifyListChange(UsableListChangeTypeId.Remove, index, deleteCount);
        super.removeRange(index, deleteCount);
    }

    override removeItems(items: readonly T[], beforeRemoveRangeCallBack?: ComparableList.BeforeRemoveRangeCallBack) {
        super.removeItems(items, (index, count) => { this.handleBeforeRemoveRangeCallback(index, count, beforeRemoveRangeCallBack); } )
    }

    override extract(value: T): T {
        const idx = this.indexOf(value);
        if (idx < 0) {
            throw new AssertInternalError('CSMCLE40401', `${JSON.stringify(value)}`);
        } else {
            this.notifyListChange(UsableListChangeTypeId.Remove, idx, 1);
            const result = this.items[idx];
            super.removeAtIndex(idx);
            return result;
        }
    }

    override clear() {
        const count = this.count;
        if (count > 0) {
            this.notifyListChange(UsableListChangeTypeId.Clear, 0, count)
        }
        super.clear();
    }

    subscribeListChangeEvent(handler: RecordList.ListChangeEventHandler): MultiEvent.DefinedSubscriptionId {
        return this._listChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void {
        this._listChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeCorrectnessChangedEvent(handler: CorrectnessList.CorrectnessChangedEventHandler): MultiEvent.DefinedSubscriptionId {
        return this._correctnessChangedMultiEvent.subscribe(handler);
    }

    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessChangedMultiEvent.unsubscribe(subscriptionId);
    }

    protected override assign(other: ChangeSubscribableComparableList<T>) {
        this._correctnessId = other.correctnessId;
        super.assign(other);
    }

    private handleBeforeRemoveRangeCallback(index: Integer, count: Integer, originalBeforeRemoveRangeCallBack: ComparableList.BeforeRemoveRangeCallBack | undefined) {
        this.notifyListChange(UsableListChangeTypeId.Remove, index, count);
        if (originalBeforeRemoveRangeCallBack !== undefined) {
            originalBeforeRemoveRangeCallBack(index, count);
        }
    }

    private notifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        const handlers = this._listChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, index, count);
        }
    }

    private notifyCorrectnessChanged() {
        const handlers = this._correctnessChangedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i]();
        }
    }
}
