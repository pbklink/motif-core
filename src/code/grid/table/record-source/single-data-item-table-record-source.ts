/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataItem } from '../../../adi/internal-api';
import { TypedTableRecordSource } from './typed-table-record-source';

export abstract class SingleDataItemTableRecordSource extends TypedTableRecordSource {
    private _singleDataItem: DataItem;

    get singleDataItem() { return this._singleDataItem; }

    protected setSingleDataItem(value: DataItem) {
        this._singleDataItem = value;
    }
}
