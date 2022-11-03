/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataItem } from '../../adi/adi-internal-api';
import { KeyedCorrectnessRecord, KeyedCorrectnessRecordList } from '../../sys/sys-internal-api';
import { RecordTableRecordSource } from './record-table-record-source';

export abstract class SingleDataItemRecordTableRecordSource<
        Record extends KeyedCorrectnessRecord,
        RecordList extends KeyedCorrectnessRecordList<Record>
    >
    extends RecordTableRecordSource<Record, RecordList> {

    private _singleDataItem: DataItem;

    get singleDataItem() { return this._singleDataItem; }

    protected setSingleDataItem(value: DataItem) {
        this._singleDataItem = value;
    }
}
