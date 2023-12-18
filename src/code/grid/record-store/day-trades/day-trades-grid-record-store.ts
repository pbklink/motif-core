/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DayTradesDataItem } from '../../../adi/adi-internal-api';
import {
    AssertInternalError,
    GridRecordStore,
    GridRecordStoreRecordsEventers,
    Integer,
    MultiEvent,
    UnreachableCaseError,
    UsableListChangeTypeId
} from "../../../sys/sys-internal-api";

export class DayTradesGridRecordStore implements GridRecordStore {
    private _recordsEventers: GridRecordStoreRecordsEventers;

    private _dataItem: DayTradesDataItem | undefined;
    private _records: DayTradesDataItem.Record[] = [];
    private _recordCount = 0;

    private _dataItemListChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _dataItemRecordChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _dataItemDataCorrectnessChangeSubscriptionId: MultiEvent.SubscriptionId;

    get recordCount() { return this._recordCount; }
    get dataItem() { return this._dataItem; } // used by ArcLight

    setRecordEventers(recordsEventers: GridRecordStoreRecordsEventers): void {
        this._recordsEventers = recordsEventers;
    }

    setDataItem(value: DayTradesDataItem) {
        this.clearDataItem();
        this._dataItem = value;
        this._dataItemListChangeSubscriptionId = this._dataItem.subscribeListChangeEvent(
            (listChangeTypeId, index, count) => this.handleDataItemListChangeEvent(listChangeTypeId, index, count)
        );
        this._dataItemRecordChangeSubscriptionId = this._dataItem.subscribeRecordChangeEvent(
            (index) => this.handleDataItemRecordChangeEvent(index)
        );
        this._dataItemDataCorrectnessChangeSubscriptionId = this._dataItem.subscribeCorrectnessChangedEvent(
            () => this.handleDataItemDataCorrectnessChangedEvent()
        );
        this._records = this._dataItem.records;
        this._recordCount = this._dataItem.recordCount;

        if (this._dataItem.usable) {
            this.processListChange(UsableListChangeTypeId.Usable, 0, 0);
        }
    }

    clearDataItem() {
        if (this._dataItem !== undefined) {
            this.processListChange(UsableListChangeTypeId.Clear, 0, 0); // empty Grid
            if (!this._dataItem.usable) {
                this.processListChange(UsableListChangeTypeId.Usable, 0, 0); // leave in good state
            }

            this._dataItem.unsubscribeListChangeEvent(this._dataItemListChangeSubscriptionId);
            this._dataItemListChangeSubscriptionId = undefined;
            this._dataItem.unsubscribeRecordChangeEvent(this._dataItemRecordChangeSubscriptionId);
            this._dataItemRecordChangeSubscriptionId = undefined;
            this._dataItem.unsubscribeCorrectnessChangedEvent(this._dataItemDataCorrectnessChangeSubscriptionId);
            this._dataItemDataCorrectnessChangeSubscriptionId = undefined;

            this._dataItem = undefined;
            this._recordCount = 0;
            this._records = [];
        }
    }

    getRecord(index: Integer) {
        return this._records[index];
    }

    getRecords() {
        return this._records.slice(0, this.recordCount);
    }

    // addFields(fields: readonly DayTradesGridField[]) {
    //     this._fieldsEventers.addFields(fields);
    // }

    recordsLoaded() {
        this._recordsEventers.recordsLoaded();
    }

    // used by ArcLight
    allRecordsDeleted() {
        this._recordsEventers.allRecordsDeleted();
    }

    // used by ArcLight
    recordsInserted(firstInsertedRecordIndex: number, count: number) {
        this._recordsEventers.recordsInserted(firstInsertedRecordIndex, count);
    }

    // used by ArcLight
    recordsDeleted(recordIndex: number, count: number) {
        this._recordsEventers.recordsDeleted(recordIndex, count);
    }

    // used by ArcLight
    invalidateRecord(recordIndex: number) {
        this._recordsEventers.invalidateRecord(recordIndex);
    }

    private handleDataItemListChangeEvent(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        this.processListChange(listChangeTypeId, index, count);
    }

    private handleDataItemRecordChangeEvent(index: Integer) {
        this._recordsEventers.invalidateRecord(index);
    }

    private handleDataItemDataCorrectnessChangedEvent() {
        this._recordsEventers.recordsLoaded();
    }

    // private adjustRecordIndex(idx: Integer) {
    //     return this._recordCount - idx - 1;
    // }

    private processListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                // handled through badness change
                // this.notifyListChange(UsableListChangeTypeId.Unusable, 0, 0);
                break;
            case UsableListChangeTypeId.PreUsableClear:
                this._recordCount = 0;
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                this._recordCount += count;
                break;
            case UsableListChangeTypeId.Usable:
                this._recordsEventers.allRecordsDeleted();
                // this.notifyListChange(UsableListChangeTypeId.PreUsableClear, 0, 0);
                if (this._recordCount > 0) {
                    this._recordsEventers.recordsInserted(0, this._recordCount);
                    // this.notifyListChange(UsableListChangeTypeId.PreUsableAdd, 0, this._recordCount);
                }
                // flagged usable through badness change
                // this.notifyListChange(UsableListChangeTypeId.Usable, 0, 0);
                break;
            case UsableListChangeTypeId.Insert:
                this._recordCount += count;
                this._recordsEventers.recordsInserted(index, count);
                // this.notifyListChange(UsableListChangeTypeId.Insert, index, count);
                break;
            case UsableListChangeTypeId.BeforeReplace:
                throw new AssertInternalError('DTGRSPLCBR19662');
            case UsableListChangeTypeId.AfterReplace:
                throw new AssertInternalError('DTGRSPLCAR19662');
            case UsableListChangeTypeId.BeforeMove:
                throw new AssertInternalError('DTGRSPLCBM19662');
            case UsableListChangeTypeId.AfterMove:
                throw new AssertInternalError('DTGRSPLCAM19662');
            case UsableListChangeTypeId.Remove:
                this._recordsEventers.recordsDeleted(index, count);
                // this.notifyListChange(UsableListChangeTypeId.Remove, index, count);
                this._recordCount -= count;
                break;
            case UsableListChangeTypeId.Clear:
                this._recordsEventers.allRecordsDeleted();
                // this.notifyListChange(UsableListChangeTypeId.Clear, 0, 0);
                this._recordCount = 0;
                break;
            default:
                throw new UnreachableCaseError('DTGRSPLCD19662', listChangeTypeId);
        }
    }

    // private createRecordsInReverseOrderArray() {
    //     const count = this._recordCount;
    //     const result = new Array<DayTradesDataItem.Record>(count);
    //     if (count > 0) {
    //         let last = count - 1;
    //         for (let i = 0; i < count; i++) {
    //             result[i] = this._records[last--];
    //         }
    //     }
    //     return result;
    // }
}
