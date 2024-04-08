/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BadnessList } from './badness-list';
import { BadnessMappedComparableList } from './badness-mapped-comparable-list';
import { AssertInternalError, Guid, Integer, LockItemByKeyList, LockOpenListItem, MapKey, Ok, Result, UsableListChangeType, UsableListChangeTypeId } from './xilytix-sysutils';

export abstract class LockOpenList<Item extends (LockOpenListItem<Item, Error> & ContravariantBase), ContravariantBase = Item, Error = string>
    extends BadnessMappedComparableList<Item, ContravariantBase>
    implements LockItemByKeyList<Item, Error>, BadnessList<Item> {

    private _nullListId: Guid;

    get nullListId() { return this._nullListId; }

    // getItemLockCount(item: Item) { return this._items[item.index].lockCount; }
    // getItemAtIndexLockCount(index: Integer) { return this._items[index].lockCount; }
    // getItemLockers(item: Item) { return this._items[item.index].lockers; }
    // getItemOpeners(item: Item) { return this._items[item.index].openers; }

    override indexOf(item: Item) {
        return item.index;
    }

    override setAt(index: Integer, value: Item) {
        const item = this.getAt(index);
        if (item.lockCount !== 0) {
            throw new AssertInternalError('LOLSA24992', `${index}, ${item.lockCount}`);
        } else {
            super.setAt(index, value);
        }
    }

    override remove(item: Item) {
        if (item.lockCount !== 0) {
            throw new AssertInternalError('LOLR24992', `${item.index}, ${item.lockCount}`);
        } else {
            const index = item.index;
            super.removeAtIndex(index);
            this.reindexFrom(index);
        }
    }

    override removeAtIndex(index: Integer) {
        const item = this.getAt(index);
        if (item.lockCount !== 0) {
            throw new AssertInternalError('LOLRAI24992', `${item.index}, ${item.lockCount}`);
        } else {
            super.removeAtIndex(index);
            this.reindexFrom(index);
        }
    }

    override removeAtIndices(removeIndices: Integer[]) {
        let lowestRemoveIndex = this.count;
        for (const removeIndex of removeIndices) {
            const item = this.getAt(removeIndex);
            if (item.lockCount !== 0) {
                throw new AssertInternalError('LOLRAI24992', `${item.index}, ${item.lockCount}`);
            } else {
                const itemIndex = item.index;
                if (itemIndex < lowestRemoveIndex) {
                    lowestRemoveIndex = itemIndex;
                }
            }
        }
        super.removeAtIndices(removeIndices);
        this.reindexFrom(lowestRemoveIndex);
    }

    override removeRange(index: Integer, deleteCount: Integer) {
        const nextRangeIdx = index + deleteCount;
        for (let i = index; i < nextRangeIdx; i++) {
            const item = this.getAt(i);
            if (item.lockCount !== 0) {
                throw new AssertInternalError('LOLRR24992', `${item.index}, ${item.lockCount}`);
            }
        }
        super.removeRange(index, deleteCount);
        this.reindexFrom(index);
    }

    override removeItems(removeItems: readonly Item[]) {
        const removeCount = removeItems.length;
        for (let i = 0; i < removeCount; i++) {
            const item = this.getAt(i);
            if (item.lockCount !== 0) {
                throw new AssertInternalError('LOLRI24992', `${item.index}, ${item.lockCount}`);
            }
        }
        super.removeItems(removeItems);
    }

    override clear() {
        const count = this.count;
        for (let i = 0; i < count; i++) {
            const item = this.getAt(i);
            if (item.lockCount !== 0) {
                throw new AssertInternalError('LOLC24992', `${item.index}, ${item.lockCount}`);
            }
        }
        super.clear();
    }

    tryLockItemByKey(key: MapKey, locker: LockOpenListItem.Locker): Promise<Result<Item | undefined, Error>> {
        const idx = this.indexOfKey(key);
        if (idx < 0) {
            return Promise.resolve(new Ok(undefined));
        } else {
            // Replace with Promise.withResolvers when available in TypeScript (ES2023)
            let resolve: (value: Result<Item | undefined, Error>) => void;
            const resultPromise = new Promise<Result<Item | undefined, Error>>((res) => {
                resolve = res;
            });

            const lockPromise = this.tryLockItemAtIndex(idx, locker);
            lockPromise.then(
                (lockResult) => {
                    resolve(lockResult);
                },
                (reason) => { throw AssertInternalError.createIfNotError(reason, 'LOLTLIBK64164'); }
            );
            return resultPromise;
        }
    }

    tryLockItemAtIndex(idx: Integer, locker: LockOpenListItem.Locker): Promise<Result<Item, Error>> {
        // Replace with Promise.withResolvers when available in TypeScript (ES2023)
        let resolve: (value: Result<Item, Error>) => void;
        const resultPromise = new Promise<Result<Item, Error>>((res) => {
            resolve = res;
        });

        const item = this.getAt(idx);
        const lockPromise = item.tryLock(locker);
        lockPromise.then(
            (lockResult) => {
                if (lockResult.isOk()) {
                    resolve(new Ok(item));
                } else {
                    resolve(lockResult.createType());
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'LOLTLIAI64164'); }
        );

        return resultPromise;
    }

    unlockItem(item: Item, locker: LockOpenListItem.Locker) {
        const idx = item.index;
        this.unlockItemAtIndex(idx, locker);
    }

    unlockItemAtIndex(idx: Integer, locker: LockOpenListItem.Locker) {
        if (idx < 0) {
            throw new AssertInternalError('LSUE81198', `"${locker.lockerName}", ${idx}`);
        } else {
            const item = this.getAt(idx);
            item.unlock(locker);
        }
    }

    isItemLocked(item: Item, ignoreOnlyLocker: LockOpenListItem.Locker | undefined): boolean {
        const idx = item.index;
        return this.isItemAtIndexLocked(idx, ignoreOnlyLocker);
    }

    isItemAtIndexLocked(idx: Integer, ignoreOnlyLocker: LockOpenListItem.Locker | undefined): boolean {
        const item = this.getAt(idx);
        return item.isLocked(ignoreOnlyLocker);
    }

    isAnyItemLocked() {
        const count = this.count;
        for (let i = 0; i < count; i++) {
            const item = this.getAt(i);
            if (item.isLocked(undefined)) {
                return true;
            }
        }
        return false;
    }

    isAnyItemInRangeLocked(idx: Integer, count: Integer) {
        const afterRangeIndex = idx + count;
        for (let i = idx; i < afterRangeIndex; i++) {
            const item = this.getAt(i);
            if (item.isLocked(undefined)) {
                return true;
            }
        }
        return false;
    }

    openLockedItem(item: Item, opener: LockOpenListItem.Opener): void {
        item.openLocked(opener);
    }

    closeLockedItem(item: Item, opener: LockOpenListItem.Opener) {
        item.closeLocked(opener);
    }

    lockAllItems(locker: LockOpenListItem.Locker): Promise<Result<Item, Error>[]> {
        const count = this.count;
        const lockResultPromises = new Array<Promise<Result<Item, Error>>>(count);
        for (let i = 0; i < count; i++) {
            lockResultPromises[i] = this.tryLockItemAtIndex(i, locker);
        }
        return Promise.all(lockResultPromises);
    }

    lockItems(items: Item[], locker: LockOpenListItem.Locker) {
        const count = items.length;
        const lockResultPromises = new Array<Promise<Result<Item | undefined, Error>>>(count);
        for (let i = 0; i < count; i++) {
            const item = items[i];
            lockResultPromises[i] = this.tryLockItemByKey(item.mapKey, locker);
        }
        return Promise.all(lockResultPromises);
    }

    // lockAllExceptNull(locker: ListService.Locker): ListService.List<Item> {
    //     const result = new ListService.List<Item>();
    //     result.capacity = this.count;
    //     for (let i = 0; i < this.count; i++) {
    //         const item = this.getItem(i);
    //         if (!(item instanceof NullTableRecordDefinitionList)) {
    //             this.lockEntry(i, locker);
    //             result.add(item);
    //         }
    //     }
    //     return result;
    // }

    unlockItems(items: readonly Item[], locker: LockOpenListItem.Locker) {
        for (const item of items) {
            this.unlockItem(item, locker);
        }
    }

    protected override assign(other: LockOpenList<Item, ContravariantBase, Error>) {
        this._nullListId = other._nullListId;
        super.assign(other);
    }

    protected override notifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        // Need to update items index before or after depending on list change type
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Insert:
                this.reindexFrom(index);
                if (this.usable) {
                    super.notifyListChange(listChangeTypeId, index, count);
                }
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                this.reindexFrom(index);
                super.notifyListChange(listChangeTypeId, index, count);
                break;
            case UsableListChangeTypeId.AfterReplace: {
                const nextRangeIndex = index + count;
                for (let i = index; i < nextRangeIndex; i++) {
                    const item = this.getAt(i);
                    item.index = i;
                }
                super.notifyListChange(listChangeTypeId, index, count);
                break;
            }
            case UsableListChangeTypeId.AfterMove: {
                const { fromIndex, toIndex, count: moveCount } = UsableListChangeType.getMoveParameters(index);
                if (moveCount > 0 && fromIndex !== toIndex) {
                    if (fromIndex < toIndex) {
                        const reindexRange = toIndex - fromIndex + moveCount;
                        this.reindexRange(fromIndex, reindexRange);
                    } else {
                        const reindexRange = fromIndex - toIndex  + moveCount;
                        this.reindexRange(toIndex, reindexRange);
                    }
                }
            }
        }

    }

    private reindexFrom(index: Integer) {
        const count = this.count;
        for (let i = index; i < count; i++) {
            const item = this.getAt(i);
            item.index = i;
        }
    }

    private reindexRange(index: Integer, rangeLength: Integer) {
        const nextRangeIndex = index + rangeLength;
        for (let i = index; i < nextRangeIndex; i++) {
            const item = this.getAt(i);
            item.index = i;
        }
    }
}

export namespace LockOpenList {
    export type ListChangeEventHandler = (this: void, listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) => void;
}
