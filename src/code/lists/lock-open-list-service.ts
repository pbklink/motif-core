/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError } from '../sys/internal-error';
import { ComparableList, compareString, CorrectnessBadness } from '../sys/sys-internal-api';
import { Guid, Integer } from '../sys/types';
import { LockOpenListItem } from './lock-open-list-item';

export abstract class LockOpenListService<Item extends LockOpenListItem> extends CorrectnessBadness {
    // private localFilePath = '';
    // private groupLoadFilePath = TableRecordDefinitionListDirectory.defaultGroupLoadFilePath;
    // private groupLoadFileAccessTypeId = TableRecordDefinitionListDirectory.defaultGroupLoadFileAccessTypeId;
    // private groupSaveEnabled = TableRecordDefinitionListDirectory.defaultGroupSaveEnabled;
    // private groupSaveFilePath = TableRecordDefinitionListDirectory.defaultGroupSaveFilePath;
    // private groupSaveFileAccessTypeId = TableRecordDefinitionListDirectory.defaultGroupSaveFileAccessTypeId;

    private readonly _entries = new Array<LockOpenListService.Entry<Item>>();
    private readonly _idMap = new Map<string, LockOpenListService.Entry<Item>>();

    private _nullListId: Guid;

    // private localSaveModified: boolean;
    // private nextPeriodicLocalSaveCheckTickLimit: SysTick.Time;
    // private localSavePeriodicRequired: boolean;

    get nullListId() { return this._nullListId; }
    get count() { return this._entries.length; }

    getItem(idx: Integer) { return this._entries[idx].item; }

    getAllItemsAsArray(): Item[] {
        const maxCount = this._entries.length;
        const result = new Array<Item>(maxCount);
        let count = 0;
        for (let i = 0; i < maxCount; i++) {
            const entry = this._entries[i];
            if (!entry.deleted) {
                result[count++] = entry.item;
            }
        }
        result.length = count;
        return result;
    }

    indexOfItem(item: Item): Integer {
        return this._entries.findIndex((entry: LockOpenListService.Entry<Item>) => entry.item.equals(item));
    }

    indexOfId(id: Guid): Integer {
        return this._entries.findIndex((entry: LockOpenListService.Entry<Item>) => entry.item.id === id);
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

    // deleteList(idx: Integer) {
    //     if (this.entries[idx].lockCount !== 0) {
    //         throw new AssertInternalError('TRDLDDL2499', `${idx}, ${this.entries[idx].lockCount}`);
    //     } else {
    //         if (!this.entries[idx].list.builtIn) {
    //             this.localSaveModified = true;
    //         }

    //         if (idx === this.entries.length - 1) {
    //             this.entries.length -= 1;
    //         } else {
    //             this.entries[idx].markDeleted();
    //             this._markDeletedCount += 1;
    //         }
    //     }
    // }

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

    addItem(item: Item): Integer {
        const entry = new LockOpenListService.Entry(item);
        this._idMap.set(item.id, entry);
        return this._entries.push(entry) - 1;
    }

    addItems(items: Item[], addCount?: Integer) {
        if (addCount === undefined) {
            addCount = items.length;
        }
        const firstAddIdx = this._entries.length;
        this._entries.length = firstAddIdx + addCount;
        for (let i = 0; i < addCount; i++) {
            const item = items[i];
            const entry = new LockOpenListService.Entry(item);
            this._entries[firstAddIdx + i] = entry;
            this._idMap.set(item.id, entry);
        }
        return firstAddIdx;
    }

    lockId(id: Guid, locker: LockOpenListService.Locker): Integer | undefined {
        const idx = this.indexOfId(id);
        if (this.indexOfId(id) < 0) {
            return undefined;
        } else {
            this.lockEntry(idx, locker);
            return idx;
        }
    }

    lockEntry(idx: Integer, locker: LockOpenListService.Locker): Item {
        this._entries[idx].lock(locker);
        return this._entries[idx].item;
    }

    unlock(item: Item, locker: LockOpenListService.Locker) {
        const idx = this.indexOfItem(item);
        if (idx === -1) {
            throw new AssertInternalError('LSUL81198', `"${item.name}", "${locker.name}"`);
        } else {
            this.unlockEntry(idx, locker);
        }
    }

    unlockEntry(idx: Integer, locker: LockOpenListService.Locker) {
        if (idx < 0) {
            throw new AssertInternalError('LSUE81198', `"${locker.name}", ${idx}`);
        } else {
            this._entries[idx].unlock(locker);
        }
    }

    isLocked(item: Item, ignoreOnlyLocker: LockOpenListService.Locker | undefined): boolean {
        const idx = this.indexOfItem(item);
        if (idx === -1) {
            throw new AssertInternalError('LSIS81199', `"${item.name}"`);
        } else {
            return this.isEntryLocked(idx, ignoreOnlyLocker);
        }
    }

    isEntryLocked(idx: Integer, ignoreOnlyLocker: LockOpenListService.Locker | undefined): boolean {
        return this._entries[idx].isLocked(ignoreOnlyLocker);
    }

    openId(id: Guid, opener: LockOpenListService.Opener): Item | undefined {
        const idx = this.indexOfId(id);
        if (this.indexOfId(id) < 0) {
            return undefined;
        } else {
            return this.openEntry(idx, opener);
        }
    }

    openEntry(idx: Integer, opener: LockOpenListService.Opener): Item {
        this._entries[idx].open(opener);
        return this._entries[idx].item;
    }

    close(item: Item, opener: LockOpenListService.Opener) {
        const idx = this.indexOfItem(item);
        if (idx === -1) {
            throw new AssertInternalError('LSC30305', `"${item.name}", "${opener.name}"`);
        } else {
            this.closeEntry(idx, opener);
        }
    }

    closeEntry(idx: Integer, opener: LockOpenListService.Opener) {
        if (idx < 0) {
            throw new AssertInternalError('LSCE30305', `"${opener.name}"`);
        } else {
            this._entries[idx].close(opener);
        }
    }

    lockAll(locker: LockOpenListService.Locker): LockOpenListService.List<Item> {
        const result = new LockOpenListService.List<Item>();
        result.capacity = this.count;
        for (let i = 0; i < this.count; i++) {
            this.lockEntry(i, locker);
            result.add(this.getItem(i));
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

    unlockLockList(lockList: LockOpenListService.List<Item>, locker: LockOpenListService.Locker) {
        for (let i = 0; i < lockList.count; i++) {
            this.unlock(lockList.getItem(i), locker);
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
}

export namespace LockOpenListService {
    export interface Subscriber {
        subscriberDescriminator(): void;
    }

    export interface Locker extends Subscriber {
        lockerDescriminator(): void;
        readonly name: string;
    }

    export interface Opener {
        readonly name: string;
    }

    export class Entry<Item extends LockOpenListItem> {
        private _lockCount = 0;
        private _lockers = new Array<Locker>(0);
        private _openCount = 0;
        private _openers = new Array<Opener>(0);
        private _deleted = false;

        get lockCount() { return this._lockCount; }
        get lockers() { return this._lockers; }
        get openCount() { return this._openCount; }
        get openers() { return this._openers; }
        get deleted() { return this._deleted; }

        constructor(readonly item: Item) {

        }

        open(opener: Opener) {
            this._openers.push(opener);
            if (this._openers.length === 1) {
                this.item.open();
            }
        }

        close(opener: Opener) {
            const idx = this._openers.indexOf(opener);
            if (idx < 0) {
                throw new AssertInternalError('LSEC81191', `"${opener.name}", ${idx}`);
            } else {
                this._openers.splice(idx, 1);
                if (this._openers.length === 0) {
                    this.item.close();
                }
            }
        }

        lock(locker: Locker) {
            this._lockers.push(locker);
        }

        unlock(locker: Locker) {
            const idx = this._lockers.indexOf(locker);
            if (idx < 0) {
                throw new AssertInternalError('LSEU81192', `"${opener.name}", ${idx}`);
            } else {
                this._lockers.splice(idx, 1);
            }
        }

        isLocked(ignoreOnlyLocker: LockOpenListService.Locker | undefined) {
            switch (this._lockCount) {
                case 0: return false;
                case 1: return ignoreOnlyLocker === undefined || this._lockers[0] !== ignoreOnlyLocker;
                default: return true;
            }
        }

        markDeleted() {
            this._deleted = true;
        }
    }

    export class List<Item extends LockOpenListItem> extends ComparableList<Item> {

        compareName(leftIdx: Integer, rightIdx: Integer): Integer {
            const leftItem = this.getItem(leftIdx);
            const rightItem = this.getItem(rightIdx);
            return compareString(leftItem.name, rightItem.name);
        }

        // compareListType(leftIdx: Integer, rightIdx: Integer): Integer {
        //     const leftList = this.getItem(leftIdx);
        //     const rightList = this.getItem(rightIdx);
        //     return leftList.compareListTypeTo(rightList);
        // }

        find(name: string, ignoreCase: boolean): Integer | undefined {
            return ignoreCase ? this.findIgnoreCase(name) : this.findCaseSensitive(name);
        }

        findCaseSensitive(name: string): Integer | undefined {
            for (let i = 0; i < this.count; i++) {
                const list = this.getItem(i);
                if (list.name === name) {
                    return i;
                }
            }
            return undefined;
        }

        findIgnoreCase(name: string): Integer | undefined {
            const upperName = name.toUpperCase();
            for (let i = 0; i < this.count; i++) {
                const item = this.getItem(i);
                if (item.uppercaseName === upperName) {
                    return i;
                }
            }
            return undefined;
        }
    }
}
