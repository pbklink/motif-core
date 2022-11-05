/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataItem } from '../../adi/adi-internal-api';
import { KeyedCorrectnessList, KeyedCorrectnessListItem } from '../../sys/sys-internal-api';
import { KeyedCorrectnessRecordTableRecordSource } from './keyed-correctness-record-table-record-source';

export abstract class SingleDataItemRecordTableRecordSource<
        Record extends KeyedCorrectnessListItem,
        RecordList extends KeyedCorrectnessList<Record>
    >
    extends KeyedCorrectnessRecordTableRecordSource<Record, RecordList> {

    private _singleDataItem: DataItem;

    get singleDataItem() { return this._singleDataItem; }

    protected setSingleDataItem(value: DataItem) {
        this._singleDataItem = value;
    }
}
