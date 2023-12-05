/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError } from './internal-error';
import { ComparisonResult, Integer } from './types';
import { BinarySearchResult, CompareFtn, rangedAnyBinarySearch, rangedEarliestBinarySearch, rangedLatestBinarySearch, rangedQuickSort } from './utils-search';

/** @public */
export class ComparableList<T> {
    capacityIncSize: Integer | undefined;

    protected _compareItemsFtn: CompareFtn<T>;

    private _items: T[] = [];
    private _count: Integer = 0;

    constructor(compareItemsFtn?: CompareFtn<T>) {
        if (compareItemsFtn !== undefined) {
            this._compareItemsFtn = compareItemsFtn;
        }
    }

    get items() { return this._items; }
    get lastIndex() { return this._count - 1; }
    get capacity(): Integer { return this.getCapacity(); }
    set capacity(value: Integer) { this.setCapacity(value); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get count(): Integer { return this._count; }
    set count(value: Integer) { this.setCount(value); }

    clone(): ComparableList<T> {
        const result = new ComparableList(this._compareItemsFtn);
        result.assign(this);
        return result;
    }

    getAt(index: Integer): T {
        this.checkItemRangeInline(index);
        return this._items[index];
    }

    setAt(index: Integer, value: T) {
        this.checkItemRangeInline(index);
        this._items[index] = value;
    }

    toArray(): readonly T[] {
        return this._items.slice(0, this.count);
    }

    add(value: T) {
        const idx = this._count;
        this.growCheck(idx + 1);
        this._items[idx] = value;
        return this._count++;
    }

    addRange(values: readonly T[]) {
        const capacity = this._items.length;
        if (this.count === capacity) {
            this._items = this._items.concat(values);
            this._count += values.length;
        } else {
            const newCount = this._count + values.length;
            let replaceCount: Integer;
            if (newCount < capacity) {
                replaceCount = newCount;
            } else {
                replaceCount = capacity - this.count;
                this._items = this._items.concat(values.slice(replaceCount));
            }

            if (replaceCount > 0) {
                let idx = this.count;
                for (let i = 0; i < replaceCount; i++) {
                    this._items[idx++] = values[i];
                }
            }

            this._count = newCount;
        }
    }

    addSubRange(values: readonly T[], subRangeStartIndex: Integer, subRangeCount: Integer) {
        let idx = this.count;
        const capacity = this._items.length;
        const newCount = this._count + subRangeCount;
        if (newCount < capacity) {
            this._items.length = newCount;
        }
        const subRangeEndPlus1Index = subRangeStartIndex + subRangeCount;
        for (let i = subRangeStartIndex; i < subRangeEndPlus1Index; i++) {
            this._items[idx++] = values[i];
        }

        this._count = newCount;
    }

    insert(index: Integer, value: T) {
        this.checkInsertRange(index);
        this._items.splice(index, 0, value);
        this._count++;
    }

    insertRange(index: Integer, values: readonly T[]) {
        if (index === this.count) {
            this.addRange(values);
        } else {
            if (index === 0) {
                this._items = values.concat(this._items);
            } else {
                this._items.splice(index, 0, ...values);
            }
            this._count += values.length;
        }
    }

    insertSubRange(index: Integer, values: readonly T[], subRangeStartIndex: Integer, subRangeCount: Integer) {
        if (index === this.count) {
            this.addSubRange(values, subRangeStartIndex, subRangeCount);
        } else {
            this._items.splice(index, 0, ...values.slice(subRangeStartIndex, subRangeStartIndex + subRangeCount));
            this._count += values.length;
        }
    }

    remove(value: T) {
        const index = this.indexOf(value);
        if (index === -1) {
            throw new Error('Item not found');
        } else {
            this.removeAtIndex(index);
        }
    }

    removeAtIndex(index: Integer) {
        this.checkItemRangeInline(index);
        this._items.splice(index, 1);
        this._count--;
    }

    removeRange(index: Integer, deleteCount: Integer) {
        this.checkDeleteRange(index, deleteCount);
        this._items.splice(index, deleteCount);
        this._count -= deleteCount;
    }

    removeItems(items: readonly T[], beforeRemoveRangeCallBack?: ComparableList.BeforeRemoveRangeCallBack) {
        let blockLastIndex: Integer | undefined;
        for (let i = this._count - 1; i >= 0; i--) {
            const item = this._items[i];
            const toBeRemoved = items.includes(item);
            if (toBeRemoved) {
                if (blockLastIndex === undefined) {
                    blockLastIndex = i;
                }
            } else {
                if (blockLastIndex !== undefined) {
                    const index = i + 1;
                    const blockLength = blockLastIndex - i;
                    if (beforeRemoveRangeCallBack !== undefined) {
                        beforeRemoveRangeCallBack(index, blockLength);
                    }
                    this._items.splice(index, blockLength);
                    blockLastIndex = undefined;
                }
            }
        }

        if (blockLastIndex !== undefined) {
            const index = 0;
            const blockLength = blockLastIndex + 1;
            if (beforeRemoveRangeCallBack !== undefined) {
                beforeRemoveRangeCallBack(index, blockLength);
            }
            this._items.splice(index, blockLength);
        }
    }

    extract(value: T): T {
        const idx = this.indexOf(value);
        if (idx < 0) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            throw new AssertInternalError('CLE909043382', `${value}`);
        } else {
            const result = this._items[idx];
            this._items.splice(idx, 1);
            this._count--;
            return result;
        }
    }

    shift() {
        if (this._count === 0) {
            return undefined;
        } else {
            const result = this._items[0];
            this.removeAtIndex(0);
            return result;
        }
    }

    exchange(index1: Integer, index2: Integer) {
        const temp = this._items[index1];
        this._items[index1] = this._items[index2];
        this._items[index2] = temp;
    }

    move(curIndex: Integer, newIndex: Integer) {
        if (curIndex !== newIndex) {
            this.checkItemRangeInline(newIndex);
            const temp = this._items[curIndex];
            this._items.splice(curIndex, 1);
            this._items.splice(newIndex, 0, temp);
        }
    }

    first(): T {
        return this.getAt(0);
    }

    last(): T {
        return this.getAt(this._count - 1);
    }

    clear() {
        this.setCapacity(0);
    }

    contains(value: T) {
        return this.indexOf(value) >= 0;
    }

    indexOf(value: T) {
        for (let idx = 0; idx < this._count; idx++) {
            if (this._items[idx] === value) {
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
        rangedQuickSort(this._items, compareItemsFtn, 0, this._count);
    }

    binarySearchEarliest(item: T, compareItemsFtn?: CompareFtn<T>): BinarySearchResult {
        if (compareItemsFtn === undefined) {
            compareItemsFtn = this._compareItemsFtn;
        }

        return rangedEarliestBinarySearch(this._items, item, compareItemsFtn, 0, this._count);
    }

    binarySearchLatest(item: T, compareItemsFtn?: CompareFtn<T>): BinarySearchResult {
        if (compareItemsFtn === undefined) {
            compareItemsFtn = this._compareItemsFtn;
        }

        return rangedLatestBinarySearch(this._items, item, compareItemsFtn, 0, this._count);
    }

    binarySearchAny(item: T, compareItemsFtn?: CompareFtn<T>): BinarySearchResult {
        if (compareItemsFtn === undefined) {
            compareItemsFtn = this._compareItemsFtn;
        }

        return rangedAnyBinarySearch(this._items, item, compareItemsFtn, 0, this._count);
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

    protected assign(other: ComparableList<T>) {
        this.clear();
        this.addSubRange(other.items, 0, other.count);
    }

    private getCapacity(): Integer {
        return this._items.length;
    }
    private setCapacity(value: Integer) {
        this._items.length = value;
        if (value < this._count) {
            this._count = value;
        }
    }

    private setCount(value: Integer) {
        if (value < 0) {
            throw new AssertInternalError('CLSC9034121833', `${value}`);
        } else {
            if (value > this.capacity) {
                this.setCapacity(value);
            }
            this._count = value;
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
        let newCount = this._items.length;
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
        if (newCount > this._items.length) {
            this.grow(newCount);
        } else {
            if (newCount < 0) {
                throw new AssertInternalError('CLCIR988899441', `${this._count}, ${newCount}`);
            }
        }
    }
}

/** @public */
export namespace ComparableList {
    export type BeforeRemoveRangeCallBack = (this: void, index: Integer, count: Integer) => void;
}
