/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ComparableList } from './comparable-list';
import { MultiEvent } from './multi-event';
import { RecordList } from './record-list';
import { Integer, } from './types';
import { UsableListChangeType, UsableListChangeTypeId } from './usable-list-change-type';

export class ChangeSubscribableComparableList<out T extends U, in U = T> extends ComparableList<T, U> implements RecordList<T> {
    private _listChangeMultiEvent = new MultiEvent<RecordList.ListChangeEventHandler>();

    override clone(): ChangeSubscribableComparableList<T, U> {
        const result = new ChangeSubscribableComparableList<T, U>(this._compareItemsFtn);
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

    override addRange(values: readonly T[]) {
        const firstAddIndex = this.count;
        super.addRange(values);
        this.notifyListChange(UsableListChangeTypeId.Insert, firstAddIndex, values.length);
    }

    override addSubRange(values: readonly T[], rangeStartIndex: Integer, rangeCount: Integer) {
        const firstAddIndex = this.count;
        super.addSubRange(values, rangeStartIndex, rangeCount);
        this.notifyListChange(UsableListChangeTypeId.Insert, firstAddIndex, rangeCount);
    }

    override insert(index: Integer, value: T) {
        super.insert(index, value);
        this.notifyListChange(UsableListChangeTypeId.Insert, index, 1);
    }

    override insertRange(index: Integer, values: readonly T[]) {
        super.insertRange(index, values);
        this.notifyListChange(UsableListChangeTypeId.Insert, index, values.length);
    }

    override insertSubRange(index: Integer, values: readonly T[], subRangeStartIndex: Integer, subRangeCount: Integer) {
        super.insertSubRange(index, values, subRangeStartIndex, subRangeCount);
        this.notifyListChange(UsableListChangeTypeId.Insert, subRangeStartIndex, subRangeCount);
    }

    override removeAtIndex(index: Integer) {
        this.notifyListChange(UsableListChangeTypeId.Remove, index, 1);
        super.removeAtIndex(index);
    }

    override  removeAtIndices(removeIndices: Integer[]) {
        super.removeAtIndices(removeIndices, (index, count) => { this.notifyListChange(UsableListChangeTypeId.Remove, index, count); } );
    }

    override removeRange(index: Integer, deleteCount: Integer) {
        this.notifyListChange(UsableListChangeTypeId.Remove, index, deleteCount);
        super.removeRange(index, deleteCount);
    }

    override removeItems(removeItems: readonly T[]) {
        super.removeItems(removeItems, (index, count) => { this.notifyListChange(UsableListChangeTypeId.Remove, index, count); } );
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

    protected notifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        const handlers = this._listChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, index, count);
        }
    }

    protected override processExchange(fromIndex: Integer, toIndex: Integer) {
        this.notifyListChange(UsableListChangeTypeId.BeforeReplace, fromIndex, 1);
        this.notifyListChange(UsableListChangeTypeId.BeforeReplace, toIndex, 1);
        super.processExchange(fromIndex, toIndex);
        this.notifyListChange(UsableListChangeTypeId.AfterReplace, fromIndex, 1);
        this.notifyListChange(UsableListChangeTypeId.AfterReplace, toIndex, 1);
    }

    protected override processMove(fromIndex: Integer, toIndex: Integer) {
        const beforeRegistrationIndex = UsableListChangeType.registerMoveParameters(fromIndex, toIndex, 1);
        this.notifyListChange(UsableListChangeTypeId.BeforeMove, beforeRegistrationIndex, 0);
        UsableListChangeType.deregisterMoveParameters(beforeRegistrationIndex);

        super.processMove(fromIndex, toIndex);

        const afterRegistrationIndex = UsableListChangeType.registerMoveParameters(fromIndex, toIndex, 1);
        this.notifyListChange(UsableListChangeTypeId.AfterMove, afterRegistrationIndex, 0);
        UsableListChangeType.deregisterMoveParameters(afterRegistrationIndex);
    }

    protected override processMoveRange(fromIndex: Integer, toIndex: Integer, count: Integer) {
        const beforeRegistrationIndex = UsableListChangeType.registerMoveParameters(fromIndex, toIndex, count);
        this.notifyListChange(UsableListChangeTypeId.BeforeMove, beforeRegistrationIndex, 0);
        UsableListChangeType.deregisterMoveParameters(beforeRegistrationIndex);

        super.processMoveRange(fromIndex, toIndex, count);

        const afterRegistrationIndex = UsableListChangeType.registerMoveParameters(fromIndex, toIndex, count);
        this.notifyListChange(UsableListChangeTypeId.AfterMove, afterRegistrationIndex, 0);
        UsableListChangeType.deregisterMoveParameters(afterRegistrationIndex);
    }
}
