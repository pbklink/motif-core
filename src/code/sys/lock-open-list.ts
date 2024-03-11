/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BadnessList } from './badness-list';
import { ComparableList } from './comparable-list';
import { CorrectnessBadness } from './correctness-badness';
import { ErrorCode } from './error-code';
import { Ok, Result } from './error-code-with-extra-err';
import { LockOpenListItem } from './lock-open-list-item';
import { MultiEvent } from './multi-event';
import { UsableListChangeTypeId } from './usable-list-change-type';
import { AssertInternalError, Guid, Integer, MapKey } from './xiltyix-sysutils';

export abstract class LockOpenList<Item extends LockOpenListItem<Item>> extends CorrectnessBadness implements BadnessList<Item> {
    // private localFilePath = '';
    // private groupLoadFilePath = TableRecordDefinitionListDirectory.defaultGroupLoadFilePath;
    // private groupLoadFileAccessTypeId = TableRecordDefinitionListDirectory.defaultGroupLoadFileAccessTypeId;
    // private groupSaveEnabled = TableRecordDefinitionListDirectory.defaultGroupSaveEnabled;
    // private groupSaveFilePath = TableRecordDefinitionListDirectory.defaultGroupSaveFilePath;
    // private groupSaveFileAccessTypeId = TableRecordDefinitionListDirectory.defaultGroupSaveFileAccessTypeId;

    private readonly _items = new Array<Item>();
    private readonly _itemMap = new Map<MapKey, Item>();

    private _nullListId: Guid;

    private _listChangeMultiEvent = new MultiEvent<LockOpenList.ListChangeEventHandler>();

    // private localSaveModified: boolean;
    // private nextPeriodicLocalSaveCheckTickLimit: SysTick.Time;
    // private localSavePeriodicRequired: boolean;

    get nullListId() { return this._nullListId; }
    get count() { return this._items.length; }

    getItemByKey(key: MapKey) { return this._itemMap.get(key); }
    getAt(idx: Integer) { return this._items[idx]; }

    toArray(): readonly Item[] {
        return this._items;
    }

    getItemLockCount(item: Item) { return this._items[item.index].lockCount; }
    getItemAtIndexLockCount(index: Integer) { return this._items[index].lockCount; }
    getItemLockers(item: Item) { return this._items[item.index].lockers; }
    getItemOpeners(item: Item) { return this._items[item.index].openers; }

    indexOf(item: Item) {
        return item.index;
    }

    indexOfKey(key: MapKey): Integer {
        return this._items.findIndex((item: Item) => item.mapKey === key);
    }

    find(predicate: (item: Item) => boolean) {
        return this._items.find((item) => predicate(item));
    }

    // indexOfListTypeAndName(listTypeId: TableRecordDefinitionList.TypeId, name: string): Integer {
    //     const upperName = name.toUpperCase();
    //     return this.entries.findIndex(
    //         (entry: TableRecordDefinitionListDirectory.Entry) =>
    //             entry.list.typeId === listTypeId && entry.list.name.toUpperCase() === upperName);
    // }

    // addNoIdUserList(name: string, listTypeId: TableRecordDefinitionList.TypeId): Integer {
    //     const id = nanoid();
    //     return this.addUserList(id, name, listTypeId);
    // }

    // addUserList(id: Guid, name: string, listTypeId: TableRecordDefinitionList.TypeId): Integer {
    //     let list: UserTableRecordDefinitionList | undefined;
    //     switch (listTypeId) {
    //         case TableRecordDefinitionList.TypeId.Portfolio:
    //             list = new PortfolioTableRecordDefinitionList();
    //             break;
    //         case TableRecordDefinitionList.TypeId.Group:
    //             list = new GroupTableRecordDefinitionList();
    //             break;
    //         default:
    //             list = undefined;
    //     }

    //     let result: Integer;

    //     if (list === undefined) {
    //         result = -1;
    //     } else {
    //         list.setIdAndName(id, name);
    //         list.modifiedEvent = (modifiedList) => this.handleListModifiedEvent(modifiedList);
    //         list.requestIsGroupSaveEnabledEvent = () => this.handleRequestIsGroupSaveEnabledEvent();
    //         result = this.addList(list);

    //         if (list.typeId === TableRecordDefinitionList.TypeId.Group) {
    //             this.localSaveModified = true;
    //         }
    //     }

    //     return result;
    // }

    deleteItem(item: Item) {
        this.deleteItemAtIndex(item.index);
    }

    deleteItemAtIndex(idx: Integer) {
        const deleteItem = this._items[idx];
        if (deleteItem.lockCount !== 0) {
            throw new AssertInternalError('LOLDBIL24992', `${idx}, ${deleteItem.lockCount}`);
        } else {
            this.checkUsableNotifyListChange(UsableListChangeTypeId.Remove, idx, 1);

            this._itemMap.delete(deleteItem.mapKey);

            // shuffle entries down to remove
            const entriesCount = this._items.length;
            for (let i = idx + 1; i < entriesCount; i++) {
                const shuffleItem = this._items[i];
                this._items[i-1] = shuffleItem;
                shuffleItem.index = i;
            }
            this._items.length -= 1;

            // this.processItemDeleted(item);
        }
    }

    deleteItemsAtIndex(idx: Integer, count: Integer) {
        this.checkUsableNotifyListChange(UsableListChangeTypeId.Remove, idx, count);

        for (let i = idx + count - 1; i >= idx; i--) {
            const deleteItem = this._items[i];
            if (deleteItem.lockCount !== 0) {
                throw new AssertInternalError('LOLDBIL24992', `${i}, ${deleteItem.lockCount}`);
            } else {
                this._itemMap.delete(deleteItem.mapKey);
            }
        }

        // shuffle entries down to remove
        const entriesCount = this._items.length;
        for (let i = idx + count; i < entriesCount; i++) {
            const shuffleItem = this._items[i];
            this._items[i-count] = shuffleItem;
            shuffleItem.index = i;
        }
        this._items.length -= count;
    }

    // clearNonBuiltInLists() {
    //     for (let i = this.count - 1; i >= 0; i--) {
    //         if (!this.entries[i].list.builtIn) {
    //             this.deleteList(i);
    //         }
    //     }
    // }

    // clear() {
    //     for (let i = this.count - 1; i >= 0; i--) {
    //         this.deleteList(i);
    //     }
    // }

    // compareName(leftIdx: Integer, rightIdx: Integer): Integer {
    //     return this.entries[leftIdx].list.compareNameTo(this.entries[rightIdx].list);
    // }

    // compareListType(leftIdx: Integer, rightIdx: Integer): Integer {
    //     return this.entries[leftIdx].list.compareListTypeTo(this.entries[rightIdx].list);
    // }

    addItem(item: Item) {
        this._itemMap.set(item.mapKey, item);
        const index = this._items.push(item) - 1;
        item.index = index;
        // this.processItemAdded(item);
        this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, index, 1);
    }

    addItems(items: Item[], addCount?: Integer) {
        if (addCount === undefined) {
            addCount = items.length;
        }

        const firstAddIdx = this._items.length;
        this._items.length = firstAddIdx + addCount;
        let addIdx = firstAddIdx;
        for (let i = 0; i < addCount; i++) {
            const item = items[i];
            item.index = addIdx;
            this._items[addIdx++] = item;
            this._itemMap.set(item.mapKey, item);
            // this.processItemAdded(item);
        }
        this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, firstAddIdx, addCount);
    }

    clearItems() {
        const count = this.count;
        if (count > 0) {
            this.notifyListChange(UsableListChangeTypeId.Clear, 0, count);
            this._items.length = 0;
            this._itemMap.clear();
            // this.processItemsCleared();
        }
    }

    async tryLockItemByKey(key: MapKey, locker: LockOpenListItem.Locker): Promise<Result<Item | undefined>> {
        const idx = this.indexOfKey(key);
        if (idx < 0) {
            return new Ok(undefined);
        } else {
            const result = await this.tryLockItemAtIndex(idx, locker);
            return result;
        }
    }

    async tryLockItemAtIndex(idx: Integer, locker: LockOpenListItem.Locker): Promise<Result<Item>> {
        const lockResult = await this._items[idx].tryLock(locker);
        if (lockResult.isOk()) {
            return new Ok(this._items[idx]);
        } else {
            return lockResult.createOuter(ErrorCode.LockOpenList_TryLockItemAtIndex);
        }
    }

    unlockItem(item: Item, locker: LockOpenListItem.Locker) {
        const idx = item.index;
        this.unlockItemAtIndex(idx, locker);
    }

    unlockItemAtIndex(idx: Integer, locker: LockOpenListItem.Locker) {
        if (idx < 0) {
            throw new AssertInternalError('LSUE81198', `"${locker.lockerName}", ${idx}`);
        } else {
            this._items[idx].unlock(locker);
        }
    }

    isItemLocked(item: Item, ignoreOnlyLocker: LockOpenListItem.Locker | undefined): boolean {
        const idx = item.index;
        return this.isItemAtIndexLocked(idx, ignoreOnlyLocker);
    }

    isItemAtIndexLocked(idx: Integer, ignoreOnlyLocker: LockOpenListItem.Locker | undefined): boolean {
        return this._items[idx].isLocked(ignoreOnlyLocker);
    }

    isAnyItemLocked() {
        const count = this.count;
        for (let i = 0; i < count; i++) {
            if (this._items[i].isLocked(undefined)) {
                return true;
            }
        }
        return false;
    }

    isAnyItemInRangeLocked(idx: Integer, count: Integer) {
        const afterRangeIndex = idx + count;
        for (let i = idx; i < afterRangeIndex; i++) {
            if (this._items[i].isLocked(undefined)) {
                return true;
            }
        }
        return false;
    }

    openLockedItem(item: Item, opener: LockOpenListItem.Opener): void {
        this._items[item.index].openLocked(opener);
    }

    closeLockedItem(item: Item, opener: LockOpenListItem.Opener) {
        this._items[item.index].closeLocked(opener);
    }

    lockAllItems(locker: LockOpenListItem.Locker): Promise<Result<Item>[]> {
        const count = this.count;
        const lockResultPromises = new Array<Promise<Result<Item>>>(count);
        for (let i = 0; i < count; i++) {
            lockResultPromises[i] = this.tryLockItemAtIndex(i, locker);
        }
        return Promise.all(lockResultPromises);
    }

    lockItems(items: Item[], locker: LockOpenListItem.Locker) {
        const count = items.length;
        const lockResultPromises = new Array<Promise<Result<Item | undefined>>>(count);
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

    // lockAllPortfolio(locker: TableRecordDefinitionListDirectory.ILocker): TableRecordDefinitionListList {
    //     const result = new TableRecordDefinitionListList();
    //     result.capacity = this.count;
    //     for (let i = 0; i < this.count; i++) {
    //         const list = this.getList(i);
    //         if (list.typeId === TableRecordDefinitionList.TypeId.Portfolio) {
    //             this.lockEntry(i, locker);
    //             result.add(list);
    //         }
    //     }
    //     return result;
    // }

    // lockAllGroup(locker: TableRecordDefinitionListDirectory.ILocker): TableRecordDefinitionListList {
    //     const result = new TableRecordDefinitionListList();
    //     result.capacity = this.count;
    //     for (let i = 0; i < this.count; i++) {
    //         const list = this.getList(i);
    //         if (list.typeId === TableRecordDefinitionList.TypeId.Group) {
    //             this.lockEntry(i, locker);
    //             result.add(list);
    //         }
    //     }
    //     return result;
    // }

    // function LockAllMarketMovers(Locker: ILocker): TWatchItemDefinitionListList;

    unlockItems(items: readonly Item[], locker: LockOpenListItem.Locker) {
        for (const item of items) {
            this.unlockItem(item, locker);
        }
    }

    // private handleListModifiedEvent(list: TableRecordDefinitionList) {
    //     if (list.typeId !== TableRecordDefinitionList.TypeId.Group) {
    //         this.localSaveModified = true;
    //     }
    // }

    // private handleRequestIsGroupSaveEnabledEvent(): boolean {
    //     return this.groupSaveEnabled && this.groupSaveFilePath !== '';
    // }

    // private loadBuiltIn() {
    //     const idx = this.addList(new NullTableRecordDefinitionList());
    //     this._nullListId = this.entries[idx].list.id;

    //     if (Authorisations.isAsxEquitiesDataAllowed()) {
    //         // TODO:LOW These built in watch lists also contain definitions for "Global Summary" and
    //         // "Currencies". These two lists could likely be loaded even if the user doesn't
    //         // have ASX data permissions.
    //         this.loadBuiltInSymbolAndSourceServerWatchItemDefinitionLists();
    //     }
    // }

    // private loadBuiltInSymbolAndSourceServerWatchItemDefinitionLists() {
    //     for (const info of TableRecordDefinitionListDirectory.BuiltInSymbolAndSourceServerWatchItemDefinitionList.infos) {
    //         const list = new IvemIdServerTableRecordDefinitionList();
    //         list.setBuiltInParams(info.id, info.name, info.serverListName);
    //         this.addList(list);
    //     }
    // }

    subscribeListChangeEvent(handler: LockOpenList.ListChangeEventHandler) {
        return this._listChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._listChangeMultiEvent.unsubscribe(subscriptionId);
    }

    protected checkUsableNotifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        if (this.usable) {
            this.notifyListChange(listChangeTypeId, index, count);
        }
    }

    protected notifyListChange(listChangeTypeId: UsableListChangeTypeId, recIdx: Integer, recCount: Integer) {
        const handlers = this._listChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, recIdx, recCount);
        }
    }

    // protected processItemAdded(item: Item) {
    //     // For descendants
    // }

    // protected processItemDeleted(item: Item) {
    //     // For descendants
    // }

    // protected processItemsCleared() {
    //     // For descendants
    // }
}

export namespace LockOpenList {
    export type ListChangeEventHandler = (this: void, listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) => void;

    export class List<Item extends LockOpenListItem<Item>> extends ComparableList<Item> {

        // compareName(leftIdx: Integer, rightIdx: Integer): Integer {
        //     const leftItem = this.getItem(leftIdx);
        //     const rightItem = this.getItem(rightIdx);
        //     return compareString(leftItem.name, rightItem.name);
        // }

        // // compareListType(leftIdx: Integer, rightIdx: Integer): Integer {
        // //     const leftList = this.getItem(leftIdx);
        // //     const rightList = this.getItem(rightIdx);
        // //     return leftList.compareListTypeTo(rightList);
        // // }

        // find(name: string, ignoreCase: boolean): Integer | undefined {
        //     return ignoreCase ? this.findIgnoreCase(name) : this.findCaseSensitive(name);
        // }

        // findCaseSensitive(name: string): Integer | undefined {
        //     for (let i = 0; i < this.count; i++) {
        //         const list = this.getItem(i);
        //         if (list.name === name) {
        //             return i;
        //         }
        //     }
        //     return undefined;
        // }

        // findIgnoreCase(name: string): Integer | undefined {
        //     const upperName = name.toUpperCase();
        //     for (let i = 0; i < this.count; i++) {
        //         const item = this.getItem(i);
        //         if (item.upperCaseName === upperName) {
        //             return i;
        //         }
        //     }
        //     return undefined;
        // }
    }
}
