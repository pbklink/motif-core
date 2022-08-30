/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Scan, ScansService } from '../../scans/scans-internal-api';
import { Integer, MultiEvent, UnreachableCaseError, UsableListChangeTypeId } from '../../sys/sys-internal-api';
import {
    GridRecordIndex,
    GridRecordStore,
    GridRecordStoreFieldsEventers,
    GridRecordStoreRecordsEventers
} from '../grid-revgrid-types';
import { ScansGridField } from './scans-grid-field';

export class ScansGridRecordStore implements GridRecordStore {
    private _fieldsEventers: GridRecordStoreFieldsEventers;
    private _recordsEventers: GridRecordStoreRecordsEventers;

    private _listChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _scanChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _correctnessChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private readonly _scansService: ScansService) {
        this._listChangeSubscriptionId = this._scansService.subscribeListChangeEvent(
            (listChangeTypeId, index, count) => this.handleListChangeEvent(listChangeTypeId, index, count)
        );
        this._scanChangeSubscriptionId = this._scansService.subscribeScanChangeEvent(
            (index) => this.handleScanChangeEvent(index)
        );
        this._correctnessChangeSubscriptionId = this._scansService.subscribeCorrectnessChangeEvent(
            () => this.handleCorrectnessChangeEvent()
        );

    }

    destroy() {
        if (this._listChangeSubscriptionId !== undefined) {
            this._scansService.unsubscribeListChangeEvent(this._listChangeSubscriptionId);
            this._listChangeSubscriptionId = undefined;
        }

        if (this._scanChangeSubscriptionId !== undefined) {
            this._scansService.unsubscribeScanChangeEvent(this._scanChangeSubscriptionId);
            this._scanChangeSubscriptionId = undefined;
        }
        if (this._correctnessChangeSubscriptionId !== undefined) {
            this._scansService.unsubscribeCorrectnessChangeEvent(this._correctnessChangeSubscriptionId);
            this._correctnessChangeSubscriptionId = undefined;
        }
    }

    get recordCount() { return this._scansService.count; }

    setFieldEventers(fieldsEventers: GridRecordStoreFieldsEventers): void {
        this._fieldsEventers = fieldsEventers;
    }

    setRecordEventers(recordsEventers: GridRecordStoreRecordsEventers): void {
        this._recordsEventers = recordsEventers;
    }

    getRecord(index: Integer): Scan {
        return this._scansService.getScan(index);
    }

    getRecords(): readonly Scan[] {
        return this._scansService.getAllScansAsArray();
    }

    addFields(fields: readonly ScansGridField[]) {
        this._fieldsEventers.addFields(fields);
    }

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

    private handleCorrectnessChangeEvent() {
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

            case UsableListChangeTypeId.Remove:
                this._recordsEventers.recordsDeleted(index, count);
                break;

            case UsableListChangeTypeId.Clear:
                this._recordsEventers.allRecordsDeleted();
                break;

            default:
                throw new UnreachableCaseError('TFHDSLC23333232', listChangeTypeId);
        }
    }
}
