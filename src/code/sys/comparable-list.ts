/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError } from './internal-error';
import { ComparisonResult, Integer } from './types';
import { moveElementInArray, moveElementsInArray } from './utils';
import { BinarySearchResult, CompareFtn, rangedAnyBinarySearch, rangedEarliestBinarySearch, rangedLatestBinarySearch, rangedQuickSort } from './utils-search';

/** @public */
export class ComparableList<out T extends U, in U = T> {
    readonly items = new Array<T>(); // Caution, length of this array is NOT count.  It can have extra capacity

    capacityIncSize: Integer | undefined;

    protected _compareItemsFtn: CompareFtn<U>;

    private _count: Integer = 0;

    constructor(compareItemsFtn?: CompareFtn<U>) {
        if (compareItemsFtn !== undefined) {
            this._compareItemsFtn = compareItemsFtn;
        }
    }

    get lastIndex() { return this._count - 1; }
    get capacity(): Integer { return this.getCapacity(); }
    set capacity(value: Integer) { this.setCapacity(value); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get count(): Integer { return this._count; }
    set count(value: Integer) { this.setCount(value); }

    clone(): ComparableList<T, U> {
        const result = new ComparableList<T, U>(this._compareItemsFtn);
        result.assign(this);
        return result;
    }

    getAt(index: Integer): T {
        this.checkItemRangeInline(index);
        return this.items[index];
    }

    setAt(index: Integer, value: T) {
        this.checkItemRangeInline(index);
        this.items[index] = value;
    }

    toArray(): T[] {
        return this.items.slice(0, this.count);
    }

    add(value: T) {
        const idx = this._count;
        this.growCheck(idx + 1);
        this.items[idx] = value;
        return this._count++;
    }

    addUndefinedRange(undefinedValueCount: Integer) {
        const items = this.items;
        const newCount = this._count + undefinedValueCount;
        if (newCount > items.length) {
            items.length = newCount;
        }
        this._count = newCount;
    }

    addRange(values: readonly T[]) {
        const items = this.items;
        const valueCount = values.length;
        const oldCount = this._count;
        const newCount = oldCount + valueCount;
        if (newCount > items.length) {
            items.length = newCount;
        }

        let idx = oldCount;
        for (let i = 0; i < valueCount; i++) {
            items[idx++] = values[i];
        }

        this._count = newCount;
    }

    addSubRange(values: readonly T[], subRangeStartIndex: Integer, subRangeCount: Integer) {
        const items = this.items;
        let idx = this._count;
        const capacity = items.length;
        const newCount = this._count + subRangeCount;
        if (newCount < capacity) {
            items.length = newCount;
        }
        const subRangeEndPlus1Index = subRangeStartIndex + subRangeCount;
        for (let i = subRangeStartIndex; i < subRangeEndPlus1Index; i++) {
            items[idx++] = values[i];
        }

        this._count = newCount;
    }

    insert(index: Integer, value: T) {
        this.checkInsertRange(index);
        this.items.splice(index, 0, value);
        this._count++;
    }

    insertRange(index: Integer, values: readonly T[]) {
        if (index === this.count) {
            this.addRange(values);
        } else {
            const items = this.items;
            const valueCount = values.length;
            const oldCount = this._count;
            if (oldCount + valueCount > items.length) {
                items.splice(index, 0, ...values);
            } else {
                moveElementsInArray(items, index, index + valueCount, oldCount - index);
                let idx = index;
                for (let i = 0; i < valueCount; i++) {
                    items[idx++] = values[i];
                }
            }
            this._count += values.length;
        }
    }

    insertSubRange(index: Integer, values: readonly T[], subRangeStartIndex: Integer, subRangeCount: Integer) {
        if (index === this.count) {
            this.addSubRange(values, subRangeStartIndex, subRangeCount);
        } else {
            this.insertRange(index, values.slice(subRangeStartIndex, subRangeStartIndex + subRangeCount));
        }
    }

    remove(value: T) {
        const index = this.indexOf(value);
        if (index === -1) {
            throw new AssertInternalError('CLR55098');
        } else {
            this.removeAtIndex(index);
        }
    }

    removeAtIndex(index: Integer) {
        this.checkItemRangeInline(index);
        this.items.splice(index, 1);
        this._count--;
    }

    removeAtIndices(removeIndices: Integer[], beforeRemoveRangeCallBack?: ComparableList.BeforeRemoveRangeCallBack) {
        if (removeIndices.length > 0) {
            removeIndices.sort((left, right) => left - right);
            let nextRemoveIndicesIndex = removeIndices.length - 1;

            let blockLastIndex: Integer | undefined;
            for (let i = this._count - 1; i >= 0; i--) {
                const toBeRemoved = i === removeIndices[nextRemoveIndicesIndex];
                if (toBeRemoved) {
                    if (blockLastIndex === undefined) {
                        blockLastIndex = i;
                    }

                    nextRemoveIndicesIndex--;

                    if (nextRemoveIndicesIndex < 0) {
                        this.removeBlockRange(i, blockLastIndex - i + 1, beforeRemoveRangeCallBack)
                        blockLastIndex = undefined;
                        break;
                    }
                } else {
                    if (blockLastIndex !== undefined) {
                        this.removeBlockRange(i + 1, blockLastIndex - i, beforeRemoveRangeCallBack)
                        blockLastIndex = undefined;
                    }
                }
            }

            if (blockLastIndex !== undefined) {
                this.removeBlockRange(0, blockLastIndex + 1, beforeRemoveRangeCallBack)
            }
        }
    }

    removeRange(index: Integer, deleteCount: Integer) {
        this.checkDeleteRange(index, deleteCount);
        this.items.splice(index, deleteCount);
        this._count -= deleteCount;
    }

    removeItems(removeItems: readonly T[], beforeRemoveRangeCallBack?: ComparableList.BeforeRemoveRangeCallBack) {
        const items = this.items;
        let blockLastIndex: Integer | undefined;
        for (let i = this._count - 1; i >= 0; i--) {
            const item = items[i];
            const toBeRemoved = removeItems.includes(item);
            if (toBeRemoved) {
                if (blockLastIndex === undefined) {
                    blockLastIndex = i;
                }
            } else {
                if (blockLastIndex !== undefined) {
                    this.removeBlockRange(i + 1, blockLastIndex - i, beforeRemoveRangeCallBack)
                    blockLastIndex = undefined;
                }
            }
        }

        if (blockLastIndex !== undefined) {
            this.removeBlockRange(0, blockLastIndex + 1, beforeRemoveRangeCallBack)
        }
    }

    extract(value: T): T {
        const idx = this.indexOf(value);
        if (idx < 0) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            throw new AssertInternalError('CLE909043382', `${value}`);
        } else {
            const result = this.items[idx];
            this.removeAtIndex(idx);
            return result;
        }
    }

    shift() {
        if (this._count === 0) {
            return undefined;
        } else {
            const result = this.items[0];
            this.removeAtIndex(0);
            return result;
        }
    }

    exchange(index1: Integer, index2: Integer) {
        this.processExchange(index1, index2);
    }

    move(fromIndex: Integer, toIndex: Integer) {
        if (fromIndex !== toIndex) {
            this.checkItemRangeInline(toIndex);
            this.processMove(fromIndex, toIndex);
        }
    }

    moveRange(fromIndex: Integer, toIndex: Integer, count: Integer) {
        if (fromIndex !== toIndex) {
            this.checkItemRangeInline(toIndex);
            this.processMoveRange(fromIndex, toIndex, count);
        }
    }

    first(): T {
        return this.getAt(0);
    }

    last(): T {
        return this.getAt(this._count - 1);
    }

    clear() {
        this._count = 0;
        this.items.length = 0;
    }

    contains(value: T) {
        return this.indexOf(value) >= 0;
    }

    indexOf(value: T) {
        for (let idx = 0; idx < this._count; idx++) {
            if (this.items[idx] === value) {
                return idx;
            }
        }
        return -1;
    }

    compareItems(left: T, right: T): ComparisonResult {
        return this._compareItemsFtn(left, right);
    }

    sort(compareItemsFtn?: CompareFtn<T>) {
        if (compareItemsFtn === undefined) {
            compareItemsFtn = this._compareItemsFtn;
        }
        rangedQuickSort(this.items, compareItemsFtn, 0, this._count);
    }

    binarySearchEarliest(item: T, compareItemsFtn?: CompareFtn<T>): BinarySearchResult {
        if (compareItemsFtn === undefined) {
            compareItemsFtn = this._compareItemsFtn;
        }

        return rangedEarliestBinarySearch(this.items, item, compareItemsFtn, 0, this._count);
    }

    binarySearchLatest(item: T, compareItemsFtn?: CompareFtn<T>): BinarySearchResult {
        if (compareItemsFtn === undefined) {
            compareItemsFtn = this._compareItemsFtn;
        }

        return rangedLatestBinarySearch(this.items, item, compareItemsFtn, 0, this._count);
    }

    binarySearchAny(item: T, compareItemsFtn?: CompareFtn<T>): BinarySearchResult {
        if (compareItemsFtn === undefined) {
            compareItemsFtn = this._compareItemsFtn;
        }

        return rangedAnyBinarySearch(this.items, item, compareItemsFtn, 0, this._count);
    }

    trimExcess() {
        this.setCapacity(this._count);
    }

    setMinimumCapacity(value: Integer) {
        if (this.capacity < value) {
            this.setCapacity(value);
        }
    }

    setGrowthCapacity(growth: Integer) {
        this.growCheck(this._count + growth);
    }

    protected assign(other: ComparableList<T, U>) {
        this.clear();
        this.addSubRange(other.items, 0, other.count);
    }

    protected processExchange(index1: number, index2: number) {
        const temp = this.items[index1];
        this.items[index1] = this.items[index2];
        this.items[index2] = temp;
    }

    protected processMove(fromIndex: Integer, toIndex: Integer) {
        moveElementInArray(this.items, fromIndex, toIndex);
    }

    protected processMoveRange(fromIndex: Integer, toIndex: Integer, count: Integer) {
        moveElementsInArray(this.items, fromIndex, toIndex, count);
    }

    private getCapacity(): Integer {
        return this.items.length;
    }
    private setCapacity(value: Integer) {
        this.items.length = value;
        if (value < this._count) {
            if (value === 0) {
                this.clear();
            } else {
                this.removeRange(value, this._count - value);
            }
        }
    }

    private setCount(value: Integer) {
        if (value < 0) {
            throw new AssertInternalError('CLSC9034121833', `${value}`);
        } else {
            if (value > this._count) {
                this.addUndefinedRange(value - this._count);
            } else {
                if (value < this._count) {
                    this.removeRange(value, this._count - value);
                }
            }
        }
    }

    private checkItemRangeInline(index: Integer) {
        if ((index < 0) || (index >= this._count)) {
            throw new AssertInternalError('CLCIRIL12263498277', `${index}, ${this._count}`);
        }
    }

    private checkInsertRange(index: Integer) {
        if ((index < 0) || (index > this._count)) {
            throw new AssertInternalError('CLCIR988899441', `${index}, ${this._count}`);
        }
    }

    private checkDeleteRange(index: Integer, count: Integer) {
        if ((index < 0) || (count < 0) || (index + count > this._count)) {
            throw new AssertInternalError('CLCDR1225535829', `${index}, ${this._count}, ${count}`);
        }
    }

    private grow(count: Integer) {
        let newCount = this.items.length;
        if (newCount === 0) {
            newCount = count;
        } else {
            do {
                if (this.capacityIncSize !== undefined) {
                    newCount += this.capacityIncSize;
                } else {
                    newCount *= 2;
                }
                if (newCount <= 0) {
                    throw new AssertInternalError('CLCIR988899441', `${count}, ${this._count}, ${newCount}`);
                }
            } while (newCount <= count);
        }
        this.setCapacity(newCount);
    }

    private growCheck(newCount: Integer) {
        if (newCount > this.items.length) {
            this.grow(newCount);
        } else {
            if (newCount < 0) {
                throw new AssertInternalError('CLCIR988899441', `${this._count}, ${newCount}`);
            }
        }
    }

    private removeBlockRange(blockStartIndex: Integer, blockLength: Integer, beforeRemoveRangeCallBack: ComparableList.BeforeRemoveRangeCallBack | undefined) {
        if (beforeRemoveRangeCallBack !== undefined) {
            beforeRemoveRangeCallBack(blockStartIndex, blockLength);
        }
        this.items.splice(blockStartIndex, blockLength);
        this._count -= blockLength;
    }
}

/** @public */
export namespace ComparableList {
    export type BeforeRemoveRangeCallBack = (this: void, index: Integer, count: Integer) => void;
}
