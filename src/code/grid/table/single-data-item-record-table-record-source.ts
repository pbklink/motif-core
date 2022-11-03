/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataItem } from '../../adi/adi-internal-api';
import { KeyedCorrectnessRecord } from '../../sys/sys-internal-api';
import { RecordTableRecordSource } from './record-table-record-source';

export abstract class SingleDataItemRecordTableRecordSource<Record extends KeyedCorrectnessRecord> extends RecordTableRecordSource<Record> {
    private _singleDataItem: DataItem;

    get singleDataItem() { return this._singleDataItem; }

    protected setSingleDataItem(value: DataItem) {
        this._singleDataItem = value;
    }
}
