/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataItem } from '../../adi/adi-internal-api';
import { KeyedCorrectnessRecord } from '../../sys/sys-internal-api';
import { RecordTableRecordDefinitionList } from './record-table-record-definition-list';

export abstract class SingleDataItemRecordTableRecordDefinitionList<Record extends KeyedCorrectnessRecord> extends RecordTableRecordDefinitionList<Record> {
    private _singleDataItem: DataItem;

    get singleDataItem() { return this._singleDataItem; }

    protected setSingleDataItem(value: DataItem) {
        this._singleDataItem = value;
    }
}
