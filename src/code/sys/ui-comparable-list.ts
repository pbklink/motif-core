/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ModifierComparableList } from './modifier-comparable-list';
import { CompareFtn, Integer } from './xilytix-sysutils';

export class UiComparableList<out T extends U, in U = T> extends ModifierComparableList<T, boolean, U> {
    constructor(compareItemsFtn?: CompareFtn<U>) {
        super(false, compareItemsFtn);
    }

    override clone(): UiComparableList<T, U> {
        const result = new UiComparableList<T, U>(this._compareItemsFtn);
        result.assign(this);
        return result;
    }

    uiSetAt(index: Integer, value: T) {
        this.setAt(index, value, true);
    }

    uiAdd(value: T) {
        return this.add(value, true);
    }

    uiAddUndefinedRange(undefinedValueCount: Integer) {
        this.addUndefinedRange(undefinedValueCount, true);
    }

    uiAddRange(values: readonly T[]) {
        this.addRange(values, true);
    }

    uiAddSubRange(values: readonly T[], rangeStartIndex: Integer, rangeCount: Integer) {
        this.addSubRange(values, rangeStartIndex, rangeCount, true);
    }

    uiInsert(index: Integer, value: T) {
        this.insert(index, value, true);
    }

    uiInsertRange(index: Integer, values: readonly T[]) {
        this.insertRange(index, values, true);
    }

    uiInsertSubRange(index: Integer, values: readonly T[], subRangeStartIndex: Integer, subRangeCount: Integer) {
        this.insertSubRange(index, values, subRangeStartIndex, subRangeCount, true);
    }

    uiRemove(value: T) {
        this.remove(value, true);
    }

    uiRemoveAtIndex(index: Integer) {
        this.removeAtIndex(index, true);
    }

    uiRemoveAtIndices(removeIndices: Integer[]) {
        this.removeAtIndices(removeIndices, true);
    }

    uiRemoveRange(index: Integer, deleteCount: Integer) {
        this.removeRange(index, deleteCount, true);
    }

    uiRemoveItems(removeItems: readonly T[]) {
        this.removeItems(removeItems, true);
    }

    uiExchange(index1: Integer, index2: Integer) {
        this.exchange(index1, index2, true);
    }

    uiClear() {
        this.clear(true);
    }
}
