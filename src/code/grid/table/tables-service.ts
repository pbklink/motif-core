/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError, Integer,
    JsonElement,
    LockOpenList,
    Logger,
    mSecsPerSec,
    SysTick
} from '../../sys/sys-internal-api';
import { GridRecordInvalidatedValue } from '../grid-revgrid-types';
import { Table } from './table';
import { TableRecordDefinitionList } from './table-record-definition-list';

export class TablesService extends LockOpenList<Table> {
    private entries: TablesService.Entry2[] = [];

    private _saveModified: boolean;
    private nextPeriodicSaveCheckTime: SysTick.Time =
        SysTick.now() + TablesService.periodicSaveCheckInterval;
    private savePeriodicRequired: boolean;

    get saveModified() {
        return this._saveModified;
    }

    add(): Integer {
        const entry = new TablesService.Entry2();
        entry.saveRequiredEvent = () => this.handleSaveRequiredEvent();
        return this.entries.push(entry) - 1;
    }

    delete(idx: Integer) {
        if (this.entries[idx].lockCount !== 0) {
            throw new AssertInternalError(
                'TDD2995887',
                `${this.entries[idx].lockCount}`
            );
        } else {
            this.entries.splice(idx, 1);
        }
    }

    clear() {
        this.entries.length = 0;
    }

    initialise() {
        this.load();
    }

    load() {
        // todo
    }

    save() {
        const rootElement = new JsonElement();
        this.saveToJson(rootElement);
        const serialisedDataIgnored = rootElement.stringify();
        // todo
    }

    checkSave(onlyIfPeriodicRequired: boolean) {
        if (
            this.savePeriodicRequired ||
            (!onlyIfPeriodicRequired && this._saveModified)
        ) {
            this.save();
        }
    }

    checkPeriodiSaveRequired(nowTime: SysTick.Time) {
        if (nowTime > this.nextPeriodicSaveCheckTime) {
            if (this._saveModified) {
                this.savePeriodicRequired = true;
            }

            this.nextPeriodicSaveCheckTime =
                nowTime + TablesService.periodicSaveCheckInterval;
        }
    }

    compareName(leftIdx: Integer, rightIdx: Integer) {
        this.entries[leftIdx].table.compareNameTo(this.entries[rightIdx].table);
    }

    lock(idx: Integer, locker: TablesService.Locker): Table {
        const entry = this.entries[idx];
        entry.lock(locker);
        return entry.table;
    }

    unlockTable(list: Table, locker: TablesService.Locker) {
        const idx = this.indexOfItem(list);
        if (idx < 0) {
            throw new AssertInternalError(
                'TDUT113872',
                `${list.recordDefinitionListName}`
            );
        } else {
            this.unlockEntry(idx, locker);
        }
    }

    isTableLocked(list: Table, ignoreLocker: TablesService.Locker): boolean {
        const idx = this.indexOfItem(list);
        if (idx < 0) {
            throw new AssertInternalError(
                'TDITL55789',
                `${list.recordDefinitionListName}`
            );
        } else {
            return this.isEntryLocked(idx, ignoreLocker);
        }
    }

    open(idx: Integer, opener: TablesService.Opener): Table {
        const entry = this.entries[idx];
        entry.open(opener);
        return entry.table;
    }

    closeTable(list: Table, opener: TablesService.Opener) {
        const idx = this.indexOfItem(list);
        if (idx < 0) {
            throw new AssertInternalError(
                'TDCT6677667',
                `${list.recordDefinitionListName}`
            );
        } else {
            this.closeEntry(idx, opener);
        }
    }

    private handleSaveRequiredEvent() {
        this._saveModified = true;
    }

    private loadFromJson(element: JsonElement): boolean {
        return false;
        // todo
    }

    private saveToJson(element: JsonElement) {
        const watchlistElements = new Array<JsonElement>(this.count);
        for (let i = 0; i < this.entries.length; i++) {
            const entry = this.entries[i];
            const watchlistElement = new JsonElement();
            entry.table.saveToJson(watchlistElement);
            watchlistElements[i] = watchlistElement;
        }
        element.setElementArray(
            TablesService.jsonTag_Watchlists,
            watchlistElements
        );
    }
}

export namespace TablesService {
    export type Locker = Table.Locker;
    export type Opener = Table.Opener;

    export type SaveRequiredEvent = (this: void) => void;

    export const jsonTag_Root = 'Watchlists';
    export const jsonTag_Watchlists = 'Watchlist';
    export const periodicSaveCheckInterval = 60.0 * mSecsPerSec;

    export class Entry2 {
        saveRequiredEvent: SaveRequiredEvent;

        private _table: Table;
        private lockers: Locker[] = [];
        private openers: Opener[] = [];

        private layoutChangeNotifying: boolean;

        constructor() {
            this._table = new Table();
            this.table.openEvent = (recordDefinitionList) =>
                this.handleOpenEvent(recordDefinitionList);
            this.table.openChangeEvent = (opened) =>
                this.handleOpenChangeEvent(opened);
            this.table.badnessChangeEvent = () =>
                this.handleBadnessChangeEvent();
            this.table.recordsLoadedEvent = () =>
                this.handleTableRecordsLoadedEvent();
            this.table.recordsInsertedEvent = (index, count) =>
                this.handleTableRecordsInsertedEvent(index, count);
            this.table.recordsDeletedEvent = (index, count) =>
                this.handleTableRecordsDeletedEvent(index, count);
            this.table.allRecordsDeletedEvent = () =>
                this.handleTableAllRecordsDeletedEvent();
            // this.table.listChangeEvent = (typeId, itemIdx, itemCount) =>
            //     this.handleListChangeEvent(typeId, itemIdx, itemCount);
            this.table.recordValuesChangedEvent = (recordIdx, invalidatedValues) =>
                this.handleRecordValuesChangedEvent(recordIdx, invalidatedValues);
            this.table.recordFieldsChangedEvent = (recordIndex, fieldIndex, fieldCount) =>
                this.handleRecordFieldsChangedEvent(recordIndex, fieldIndex, fieldCount);
            this.table.recordChangedEvent = (recordIdx) =>
                this.handleRecordChangeEvent(recordIdx);
            this.table.layoutChangedEvent = (opener) =>
                this.handleLayoutChangedEvent(opener);
            this.table.recordDisplayOrderChangedEvent = (opener) =>
                this.handleItemDisplayOrderChangedEvent(opener);
            this.table.recordDisplayOrderSetEvent = (itemIndices) =>
                this.handleItemDisplayOrderSetEvent(itemIndices);
            this.table.firstPreUsableEvent = () =>
                this.handleFirstPreUsableEvent();
        }

        get table() {
            return this._table;
        }

        get lockCount() {
            return this.lockers.length;
        }

        get openCount() {
            return this.openers.length;
        }

        open(opener: Opener) {
            this.openers.push(opener);
            if (this.openers.length === 1) {
                this._table.open();
            }
        }

        close(opener: Opener) {
            const idx = this.openers.indexOf(opener);
            if (idx < 0) {
                Logger.assert(
                    false,
                    'WatchItemDefinitionListDirectory.close: opener not found'
                );
            } else {
                this.openers.splice(idx, 1);
                if (this.openers.length === 0) {
                    this._table.close();
                }
            }
        }

        lock(locker: Locker) {
            this.lockers.push(locker);
        }

        unlock(locker: Locker) {
            const idx = this.lockers.indexOf(locker);
            if (idx < 0) {
                Logger.assert(
                    false,
                    'WatchItemDefinitionListDirectory.unlock: locker not found'
                );
            } else {
                this.lockers.splice(idx, 1);
            }
        }

        isLocked(ignoreLocker: Locker | undefined) {
            switch (this.lockCount) {
                case 0:
                    return false;
                case 1:
                    return (
                        ignoreLocker === undefined ||
                        this.lockers[0] !== ignoreLocker
                    );
                default:
                    return true;
            }
        }

        getGridOpenCount(): Integer {
            let result = 0;
            this.openers.forEach((opener: Opener) => {
                if (opener.isTableGrid()) {
                    result++;
                }
            });
            return result;
        }

        getFirstGridOpener(): Opener | undefined {
            return this.openers.find((opener: Opener) => opener.isTableGrid());
        }

        private handleOpenEvent(
            recordDefinitionList: TableRecordDefinitionList
        ) {
            this.openers.forEach((opener: Opener) =>
                opener.notifyTableOpen(recordDefinitionList)
            );
        }

        private handleBadnessChangeEvent() {
            this.openers.forEach((opener: Opener) =>
                opener.notifyTableBadnessChange()
            );
        }

        private handleOpenChangeEvent(opened: boolean) {
            this.openers.forEach((opener: Opener) =>
                opener.notifyTableOpenChange(opened)
            );
        }

        private handleTableRecordsLoadedEvent() {
            this.openers.forEach((opener: Opener) =>
                opener.notifyTableRecordsLoaded()
            );

            this.saveRequiredEvent();
        }

        private handleTableRecordsInsertedEvent(index: Integer, count: Integer) {
            this.openers.forEach((opener: Opener) =>
                opener.notifyTableRecordsInserted(index, count)
            );

            this.saveRequiredEvent();
        }

        private handleTableRecordsDeletedEvent(index: Integer, count: Integer) {
            this.openers.forEach((opener: Opener) =>
                opener.notifyTableRecordsDeleted(index, count)
            );

            this.saveRequiredEvent();
        }

        private handleTableAllRecordsDeletedEvent() {
            this.openers.forEach((opener: Opener) =>
                opener.notifyTableAllRecordsDeleted()
            );

            this.saveRequiredEvent();
        }

        // private handleListChangeEvent(
        //     typeId: UsableListChangeTypeId,
        //     itemIdx: Integer,
        //     itemCount: Integer
        // ) {
        //     this.openers.forEach((opener: Opener) =>
        //         opener.notifyTableRecordListChange(typeId, itemIdx, itemCount)
        //     );

        //     this.saveRequiredEvent();
        // }

        private handleRecordValuesChangedEvent(recordIndex: Integer, invalidatedValues: GridRecordInvalidatedValue[]) {
            this.openers.forEach((opener: Opener) =>
                opener.notifyTableRecordValuesChanged(recordIndex, invalidatedValues)
            );
        }

        private handleRecordFieldsChangedEvent(recordIndex: Integer, fieldIndex: number, fieldCount: number) {
            this.openers.forEach((opener: Opener) =>
                opener.notifyTableRecordFieldsChanged(recordIndex, fieldIndex, fieldCount)
            );
        }

        private handleRecordChangeEvent(recordIdx: Integer) {
            this.openers.forEach((opener: Opener) =>
                opener.notifyTableRecordChanged(recordIdx)
            );
        }

        private handleLayoutChangedEvent(opener: Opener) {
            if (!this.layoutChangeNotifying) {
                this.layoutChangeNotifying = true;
                try {
                    const count = this.getGridOpenCount();

                    if (count > 1) {
                        this.openers.forEach((openerElem: Opener) => {
                            if (
                                openerElem.isTableGrid() &&
                                openerElem !== opener
                            ) {
                                openerElem.notifyTableLayoutUpdated();
                            }
                        });
                    }
                } finally {
                    this.layoutChangeNotifying = false;
                }

                this.saveRequiredEvent();
            }
        }

        private handleItemDisplayOrderChangedEvent(opener: Opener) {
            const count = this.getGridOpenCount();

            if (count > 1) {
                const recIndices = opener.getOrderedGridRecIndices();
                this.openers.forEach((openerElem: Opener) => {
                    if (openerElem.isTableGrid() && openerElem !== opener) {
                        openerElem.notifyTableRecordDisplayOrderChanged(
                            recIndices
                        );
                    }
                });
            }
            this.saveRequiredEvent();
        }

        private handleItemDisplayOrderSetEvent(itemIndices: Integer[]) {
            this.openers.forEach((openerElem: Opener) => {
                if (openerElem.isTableGrid()) {
                    openerElem.notifyTableRecordDisplayOrderChanged(
                        itemIndices
                    );
                }
            });

            this.saveRequiredEvent();
        }

        private handleFirstPreUsableEvent() {
            const opener = this.getFirstGridOpener();
            if (opener !== undefined) {
                opener.notifyTableFirstPreUsable();
            }
        }
    }
}

export let tableDirectory: TablesService;

export function setTableDirectory(value: TablesService) {
    tableDirectory = value;
}
