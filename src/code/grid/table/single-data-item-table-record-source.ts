/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataItem } from '../../adi/adi-internal-api';
import { RandomIdTableRecordSource } from './table-record-source';

export abstract class SingleDataItemTableRecordSource extends RandomIdTableRecordSource {
    private _singleDataItem: DataItem;

    get singleDataItem() { return this._singleDataItem; }

    protected setSingleDataItem(value: DataItem) {
        this._singleDataItem = value;
    }
}
