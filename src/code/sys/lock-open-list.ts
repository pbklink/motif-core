/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BadnessList } from './badness-list';
import { ComparableList } from './comparable-list';
import { CorrectnessBadness } from './correctness-badness';
import { ErrorCode } from './error-code';
import { AssertInternalError } from './internal-error';
import { LockOpenListItem } from './lock-open-list-item';
import { MultiEvent } from './multi-event';
import { Ok, Result } from './result';
import { Guid, Integer, MapKey, UsableListChangeTypeId } from './types';

export abstract class LockOpenList<Item extends LockOpenListItem> extends CorrectnessBadness implements BadnessList<Item> {
    // private localFilePath = '';
    // private groupLoadFilePath = TableRecordDefinitionListDirectory.defaultGroupLoadFilePath;
    // private groupLoadFileAccessTypeId = TableRecordDefinitionListDirectory.defaultGroupLoadFileAccessTypeId;
    // private groupSaveEnabled = TableRecordDefinitionListDirectory.defaultGroupSaveEnabled;
    // private groupSaveFilePath = TableRecordDefinitionListDirectory.defaultGroupSaveFilePath;
    // private groupSaveFileAccessTypeId = TableRecordDefinitionListDirectory.defaultGroupSaveFileAccessTypeId;

    private readonly _entries = new Array<LockOpenList.Entry<Item>>();
    private readonly _entryMap = new Map<MapKey, LockOpenList.Entry<Item>>();

    private _nullListId: Guid;

    private _listChangeMultiEvent = new MultiEvent<LockOpenList.ListChangeEventHandler>();

    // private localSaveModified: boolean;
    // private nextPeriodicLocalSaveCheckTickLimit: SysTick.Time;
    // private localSavePeriodicRequired: boolean;

    get nullListId() { return this._nullListId; }
    get count() { return this._entries.length; }

    getItemByKey(key: MapKey) { return this._entryMap.get(key)?.item; }
    getAt(idx: Integer) { return this._entries[idx].item; }

    getAllItemsAsArray(): Item[] {
        const count = this._entries.length;
        const entries = this._entries;
        const result = new Array<Item>(count);
        for (let i = 0; i < count; i++) {
            const entry = entries[i];
            result[i] = entry.item;
        }
        return result;
    }

    getItemLockCount(item: Item) { return this._entries[item.index].lockCount; }
    getItemAtIndexLockCount(index: Integer) { return this._entries[index].lockCount; }
    getItemLockers(item: Item) { return this._entries[item.index].lockers; }
    getItemOpeners(item: Item) { return this._entries[item.index].openers; }

    indexOf(item: Item) {
        return item.index;
    }

    indexOfKey(key: MapKey): Integer {
        return this._entries.findIndex((entry: LockOpenList.Entry<Item>) => entry.item.mapKey === key);
    }

    find(predicate: (item: Item) => boolean) {
        return this._entries.find((entry) => predicate(entry.item));
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
        const deleteEntry = this._entries[idx];
        if (deleteEntry.lockCount !== 0) {
            throw new AssertInternalError('LOLDBIL24992', `${idx}, ${deleteEntry.lockCount}`);
        } else {
            this.checkUsableNotifyListChange(UsableListChangeTypeId.Remove, idx, 1);

            const item = deleteEntry.item;
            this._entryMap.delete(item.mapKey);

            // shuffle entries down to remove
            const entriesCount = this._entries.length;
            for (let i = idx + 1; i < entriesCount; i++) {
                const shuffleEntry = this._entries[i];
                this._entries[i-1] = shuffleEntry;
                shuffleEntry.item.index = i;
            }
            this._entries.length -= 1;

            this.processItemDeleted(item);
        }
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
        const newEntry = new LockOpenList.Entry(item);
        this._entryMap.set(item.mapKey, newEntry);
        const index = this._entries.push(newEntry) - 1;
        item.index = index;
        this.processItemAdded(item);
        this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, index, 1);
    }

    addItems(items: Item[], addCount?: Integer) {
        if (addCount === undefined) {
            addCount = items.length;
        }

        const firstAddIdx = this._entries.length;
        this._entries.length = firstAddIdx + addCount;
        let addIdx = firstAddIdx;
        for (let i = 0; i < addCount; i++) {
            const item = items[i];
            item.index = addIdx;
            const entry = new LockOpenList.Entry(item);
            this._entries[addIdx++] = entry;
            this._entryMap.set(item.mapKey, entry);
            this.processItemAdded(item);
        }
        this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, firstAddIdx, addCount);
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
        const entryResult = await this._entries[idx].tryLock(locker);
        if (entryResult.isOk()) {
            return new Ok(this._entries[idx].item);
        } else {
            return entryResult.createOuter(ErrorCode.LockOpenList_TryLockItemAtIndex);
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
            this._entries[idx].unlock(locker);
        }
    }

    isItemLocked(item: Item, ignoreOnlyLocker: LockOpenListItem.Locker | undefined): boolean {
        const idx = item.index;
        return this.isItemAtIndexLocked(idx, ignoreOnlyLocker);
    }

    isItemAtIndexLocked(idx: Integer, ignoreOnlyLocker: LockOpenListItem.Locker | undefined): boolean {
        return this._entries[idx].isLocked(ignoreOnlyLocker);
    }

    openLockedItem(item: Item, opener: LockOpenListItem.Opener): void {
        this._entries[item.index].openLocked(opener);
    }

    closeLockedItem(item: Item, opener: LockOpenListItem.Opener) {
        this._entries[item.index].closeLocked(opener);
    }

    lockAllItems(locker: LockOpenListItem.Locker): Promise<Result<Item>[]> {
        const count = this.count;
        const lockResultPromises = new Array<Promise<Result<Item>>>(count);
        for (let i = 0; i < count; i++) {
            lockResultPromises[i] = this.tryLockItemAtIndex(i, locker);
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

    protected processItemAdded(item: Item) {
        // For descendants
    }

    protected processItemDeleted(item: Item) {
        // For descendants
    }
}

export namespace LockOpenList {
    export type ListChangeEventHandler = (this: void, listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) => void;

    export class Entry<Item extends LockOpenListItem> {
        private _lockers = new Array<LockOpenListItem.Locker>(0);
        private _openers = new Array<LockOpenListItem.Opener>(0);

        constructor(readonly item: Item) {

        }

        get lockCount() { return this._lockers.length; }
        get lockers(): readonly LockOpenListItem.Locker[] { return this._lockers; }
        get openCount() { return this._openers.length; }
        get openers(): readonly LockOpenListItem.Opener[] { return this._openers; }

        openLocked(opener: LockOpenListItem.Opener): void {
            this._openers.push(opener);
            if (this._openers.length === 1) {
                this.item.processFirstOpen(opener);
            }
        }

        closeLocked(opener: LockOpenListItem.Opener) {
            const idx = this._openers.indexOf(opener);
            if (idx < 0) {
                throw new AssertInternalError('LSEC81191', `"${opener.lockerName}", ${idx}`);
            } else {
                this._openers.splice(idx, 1);
                if (this._openers.length === 0) {
                    this.item.processLastClose(opener);
                }
            }
        }

        async tryLock(locker: LockOpenListItem.Locker): Promise<Result<void>> {
            this._lockers.push(locker);
            if (this._lockers.length === 1) {
                const processFirstLockResult = await this.item.tryProcessFirstLock(locker);
                if (processFirstLockResult.isErr()) {
                    const lockerIdx = this._lockers.indexOf(locker);
                    if (lockerIdx < 0) {
                        throw new AssertInternalError('LOLETL23330');
                    } else {
                        this._lockers.splice(lockerIdx, 1);
                    }
                    return processFirstLockResult.createOuter(ErrorCode.LockOpenList_EntryTryLockProcessFirst);
                } else {
                    return new Ok(undefined);
                }
            } else {
                return new Ok(undefined);
            }
        }

        unlock(locker: LockOpenListItem.Locker) {
            const idx = this._lockers.indexOf(locker);
            if (idx < 0) {
                throw new AssertInternalError('LSEU81192', `"${locker.lockerName}", ${idx}`);
            } else {
                this._lockers.splice(idx, 1);
                if (this._lockers.length === 0) {
                    this.item.processLastUnlock(locker);
                }
            }
        }

        isLocked(ignoreOnlyLocker: LockOpenListItem.Locker | undefined) {
            switch (this.lockCount) {
                case 0: return false;
                case 1: return ignoreOnlyLocker === undefined || this._lockers[0] !== ignoreOnlyLocker;
                default: return true;
            }
        }
    }

    export class List<Item extends LockOpenListItem> extends ComparableList<Item> {

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
