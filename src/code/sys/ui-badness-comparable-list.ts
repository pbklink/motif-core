/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BadnessComparableList } from './badness-comparable-list';
import { MultiEvent } from './multi-event';
import { RecordList } from './record-list';
import { Integer, } from './types';
import { UsableListChangeTypeId } from './usable-list-change-type';

export class UiBadnessComparableList<T> extends BadnessComparableList<T> implements RecordList<T> {
    private _uiListChangeMultiEvent = new MultiEvent<RecordList.UiListChangeEventHandler>();
    private _uiChanging = false;

    override clone(): UiBadnessComparableList<T> {
        const result = new UiBadnessComparableList(this._compareItemsFtn);
        result.assign(this);
        return result;
    }

    uiSetAt(index: Integer, value: T, ui = true) {
        this._uiChanging = ui;
        this.setAt(index, value);
        this._uiChanging = false;
    }

    uiAdd(value: T, ui = true) {
        this._uiChanging = ui;
        const result = this.add(value);
        this._uiChanging = false;
        return result;
    }

    uiAddRange(values: readonly T[], ui = true) {
        this._uiChanging = ui;
        this.addRange(values);
        this._uiChanging = false;
    }

    uiAddSubRange(values: readonly T[], rangeStartIndex: Integer, rangeCount: Integer, ui = true) {
        this._uiChanging = ui;
        this.addSubRange(values, rangeStartIndex, rangeCount);
        this._uiChanging = false;
    }

    uiInsert(index: Integer, value: T, ui = true) {
        this._uiChanging = ui;
        this.insert(index, value);
        this._uiChanging = false;
    }

    uiInsertRange(index: Integer, values: readonly T[], ui = true) {
        this._uiChanging = ui;
        this.insertRange(index, values);
        this._uiChanging = false;
    }

    uiInsertSubRange(index: Integer, values: readonly T[], subRangeStartIndex: Integer, subRangeCount: Integer, ui = true) {
        this._uiChanging = ui;
        this.insertSubRange(index, values, subRangeStartIndex, subRangeCount);
        this._uiChanging = false;
    }

    uiRemove(value: T, ui = true) {
        this._uiChanging = ui;
        this.remove(value);
        this._uiChanging = false;
    }

    uiRemoveAtIndex(index: Integer, ui = true) {
        this._uiChanging = ui;
        this.removeAtIndex(index);
        this._uiChanging = false;
    }

    uiRemoveAtIndices(removeIndices: Integer[], ui = true) {
        this._uiChanging = ui;
        this.removeAtIndices(removeIndices);
        this._uiChanging = false;
    }

    uiRemoveRange(index: Integer, deleteCount: Integer, ui = true) {
        this._uiChanging = ui;
        this.removeRange(index, deleteCount);
        this._uiChanging = false;
    }

    uiRemoveItems(removeItems: readonly T[], ui = true) {
        this._uiChanging = ui;
        this.removeItems(removeItems);
        this._uiChanging = false;
    }

    uiExchange(index1: Integer, index2: Integer, ui = true) {
        this._uiChanging = ui;
        this.exchange(index1, index2);
        this._uiChanging = false;
    }

    uiClear(ui = true) {
        this._uiChanging = ui;
        this.clear();
        this._uiChanging = false;
    }

    override subscribeListChangeEvent(handler: RecordList.UiListChangeEventHandler): MultiEvent.DefinedSubscriptionId {
        return this._uiListChangeMultiEvent.subscribe(handler);
    }

    override unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void {
        this._uiListChangeMultiEvent.unsubscribe(subscriptionId);
    }

    protected override notifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        const handlers = this._uiListChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, index, count, this._uiChanging);
        }
    }
}
