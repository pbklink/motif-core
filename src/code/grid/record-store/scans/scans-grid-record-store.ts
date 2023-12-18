/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Scan, ScanList, ScansService } from '../../../scan/scan-internal-api';
import {
    GridRecordIndex,
    GridRecordStore,
    GridRecordStoreRecordsEventers
} from '../../../sys/grid-revgrid-types';
import { AssertInternalError, Integer, MultiEvent, UnreachableCaseError, UsableListChangeTypeId } from '../../../sys/sys-internal-api';

export class ScansGridRecordStore implements GridRecordStore {
    private readonly _scanList: ScanList;

    private _recordsEventers: GridRecordStoreRecordsEventers;

    private _listChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _scanChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _correctnessChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private readonly _scansService: ScansService) {
        this._scanList = this._scansService.scanList;
        this._listChangeSubscriptionId = this._scanList.subscribeListChangeEvent(
            (listChangeTypeId, index, count) => { this.handleListChangeEvent(listChangeTypeId, index, count); }
        );
        this._scanChangeSubscriptionId = this._scanList.subscribeScanChangeEvent(
            (index) => { this.handleScanChangeEvent(index); }
        );
        this._correctnessChangeSubscriptionId = this._scanList.subscribeCorrectnessChangedEvent(
            () => { this.handleCorrectnessChangedEvent(); }
        );

    }

    get recordCount() { return this._scanList.count; }

    destroy() {
        if (this._listChangeSubscriptionId !== undefined) {
            this._scanList.unsubscribeListChangeEvent(this._listChangeSubscriptionId);
            this._listChangeSubscriptionId = undefined;
        }

        if (this._scanChangeSubscriptionId !== undefined) {
            this._scanList.unsubscribeScanChangeEvent(this._scanChangeSubscriptionId);
            this._scanChangeSubscriptionId = undefined;
        }
        if (this._correctnessChangeSubscriptionId !== undefined) {
            this._scanList.unsubscribeCorrectnessChangedEvent(this._correctnessChangeSubscriptionId);
            this._correctnessChangeSubscriptionId = undefined;
        }
    }

    // setFieldEventers(fieldsEventers: GridRecordStoreFieldsEventers): void {
    //     this._fieldsEventers = fieldsEventers;
    // }

    setRecordEventers(recordsEventers: GridRecordStoreRecordsEventers): void {
        this._recordsEventers = recordsEventers;
    }

    getRecord(index: Integer): Scan {
        return this._scanList.getAt(index);
    }

    getRecords(): readonly Scan[] {
        return this._scanList.toArray();
    }

    // addFields(fields: readonly ScansGridField[]) {
    //     this._fieldsEventers.addFields(fields);
    // }

    recordsLoaded() {
        this._recordsEventers.recordsLoaded();
    }

    recordsInserted(firstInsertedRecordIndex: GridRecordIndex, count: Integer) {
        this._recordsEventers.recordsInserted(firstInsertedRecordIndex, count);
    }

    private handleListChangeEvent(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        this.processListChange(listChangeTypeId, index, count);
    }

    private handleScanChangeEvent(index: Integer) {
        this._recordsEventers.invalidateRecord(index);
    }

    private handleCorrectnessChangedEvent() {
        this._recordsEventers.recordsLoaded();
    }

    // private adjustRecordIndex(idx: Integer) {
    //     return this._recordCount - idx - 1;
    // }

    private processListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                // handled through badness change
                break;

            case UsableListChangeTypeId.PreUsableClear:
                this._recordsEventers.allRecordsDeleted();
                break;

            case UsableListChangeTypeId.PreUsableAdd:
                this._recordsEventers.recordsInserted(index, count);
                break;

            case UsableListChangeTypeId.Usable:
                // handled through badness change
                break;

            case UsableListChangeTypeId.Insert:
                this._recordsEventers.recordsInserted(index, count);
                break;

            case UsableListChangeTypeId.BeforeReplace:
                throw new AssertInternalError('SGRSPLCBR19662');

            case UsableListChangeTypeId.AfterReplace:
                throw new AssertInternalError('SGRSPLCAR19662');

            case UsableListChangeTypeId.BeforeMove:
                throw new AssertInternalError('SGRSPLCBM19662');

            case UsableListChangeTypeId.AfterMove:
                throw new AssertInternalError('SGRSPLCAM19662');

            case UsableListChangeTypeId.Remove:
                this._recordsEventers.recordsDeleted(index, count);
                break;

            case UsableListChangeTypeId.Clear:
                this._recordsEventers.allRecordsDeleted();
                break;

            default:
                throw new UnreachableCaseError('SGRSPLCD19662', listChangeTypeId);
        }
    }
}
