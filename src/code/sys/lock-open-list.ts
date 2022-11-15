/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ComparableList } from './comparable-list';
import { CorrectnessBadness } from './correctness-badness';
import { ErrorCode } from './error-code';
import { AssertInternalError } from './internal-error';
import { LockOpenListItem } from './lock-open-list-item';
import { MultiEvent } from './multi-event';
import { Ok, Result } from './result';
import { Guid, Integer, MapKey, UsableListChangeTypeId } from './types';

export abstract class LockOpenList<Item extends LockOpenListItem> extends CorrectnessBadness {
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
    getItemAtIndex(idx: Integer) { return this._entries[idx].item; }

    getAllItemsAsArray(): Item[] {
        const count = this._entries.length;
        const result = new Array<Item>(count);
        for (let i = 0; i < count; i++) {
            const entry = this._entries[i];
            result[i] = entry.item;
        }
        return result;
    }

    getItemLockCount(item: Item) { return this._entries[item.index].lockCount; }
    getItemAtIndexLockCount(index: Integer) { return this._entries[index].lockCount; }
    getItemLockers(item: Item) { return this._entries[item.index].lockers; }
    getItemOpeners(item: Item) { return this._entries[item.index].openers; }

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

    tryLockItemByKey(key: MapKey, locker: LockOpenListItem.Locker): Result<Item | undefined> {
        const idx = this.indexOfKey(key);
        if (idx < 0) {
            return new Ok(undefined);
        } else {
            return this.tryLockItemAtIndex(idx, locker);
        }
    }

    tryLockItemAtIndex(idx: Integer, locker: LockOpenListItem.Locker): Result<Item> {
        const entryResult = this._entries[idx].tryLock(locker);
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

    tryOpenItemByKey(key: MapKey, opener: LockOpenListItem.Opener): Result<Item | undefined> {
        const idx = this.indexOfKey(key);
        if (idx < 0) {
            return new Ok(undefined);
        } else {
            return this.tryOpenItemAtIndex(idx, opener);
        }
    }

    tryOpenItemAtIndex(idx: Integer, opener: LockOpenListItem.Opener): Result<Item> {
        const entryResult = this._entries[idx].tryOpen(opener);
        if (entryResult.isOk()) {
            return new Ok(this._entries[idx].item);
        } else {
            return entryResult.createOuter(ErrorCode.LockOpenList_TryOpenItemAtIndex);
        }
    }

    tryOpenLockedItem(item: Item, opener: LockOpenListItem.Opener): Result<void> {
        return this._entries[item.index].tryOpenLocked(opener);
    }

    closeItem(item: Item, opener: LockOpenListItem.Opener) {
        const idx = item.index;
        this.closeItemAtIndex(idx, opener);
    }

    closeItemAtIndex(idx: Integer, opener: LockOpenListItem.Opener) {
        if (idx < 0) {
            throw new AssertInternalError('LSCE30305', `"${opener.lockerName}"`);
        } else {
            this._entries[idx].close(opener);
        }
    }

    closeLockedItem(item: Item, opener: LockOpenListItem.Opener) {
        this._entries[item.index].closeLocked(opener);
    }

    lockAllItems(locker: LockOpenListItem.Locker): LockOpenList.List<Item> {
        const result = new LockOpenList.List<Item>();
        result.capacity = this.count;
        for (let i = 0; i < this.count; i++) {
            this.tryLockItemAtIndex(i, locker);
            result.add(this.getItemAtIndex(i));
        }
        return result;
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

    unlockLockList(lockList: LockOpenList.List<Item>, locker: LockOpenListItem.Locker) {
        for (let i = 0; i < lockList.count; i++) {
            this.unlockItem(lockList.getItem(i), locker);
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

        get lockCount() { return this._lockers.length; }
        get lockers(): readonly LockOpenListItem.Locker[] { return this._lockers; }
        get openCount() { return this._openers.length; }
        get openers(): readonly LockOpenListItem.Opener[] { return this._openers; }

        constructor(readonly item: Item) {

        }

        tryOpenLocked(opener: LockOpenListItem.Opener): Result<void> {
            this._openers.push(opener);
            if (this._openers.length === 1) {
                const processFirstOpenResult = this.item.tryProcessFirstOpen();
                if (processFirstOpenResult.isErr()) {
                    const openerIdx = this._openers.indexOf(opener);
                    if (openerIdx < 0) {
                        throw new AssertInternalError('LOLETOL23330');
                    } else {
                        this._openers.splice(openerIdx, 1);
                    }
                    return processFirstOpenResult.createOuter(ErrorCode.LockOpenList_EntryTryOpenLockedProcessFirst);
                }
            }
            return new Ok(undefined);
        }

        tryOpen(opener: LockOpenListItem.Opener): Result<void> {
            const lockResult = this.tryLock(opener);
            if (lockResult.isErr()) {
                return lockResult.createOuter(ErrorCode.LockOpenList_EntryTryOpenLock);
            } else {
                const openLockedResult = this.tryOpenLocked(opener);
                if (openLockedResult.isErr()) {
                    this.unlock(opener);
                    return openLockedResult.createOuter(ErrorCode.LockOpenList_EntryTryOpenTryOpenLocked);
                } else {
                    return new Ok(undefined);
                }
            }
        }

        closeLocked(opener: LockOpenListItem.Opener) {
            const idx = this._openers.indexOf(opener);
            if (idx < 0) {
                throw new AssertInternalError('LSEC81191', `"${opener.lockerName}", ${idx}`);
            } else {
                this._openers.splice(idx, 1);
                if (this._openers.length === 0) {
                    this.item.processLastClose();
                }
            }
        }

        close(opener: LockOpenListItem.Opener) {
            this.closeLocked(opener);
            this.unlock(opener);
        }

        tryLock(locker: LockOpenListItem.Locker): Result<void> {
            this._lockers.push(locker);
            if (this._lockers.length === 1) {
                const processFirstLockResult = this.item.tryProcessFirstLock();
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
                throw new AssertInternalError('LSEU81192', `"${opener.name}", ${idx}`);
            } else {
                this._lockers.splice(idx, 1);
                if (this._lockers.length === 0) {
                    this.item.processLastUnlock();
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
