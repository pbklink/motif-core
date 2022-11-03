/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, Feed, FeedsDataDefinition, FeedsDataItem } from '../../adi/adi-internal-api';
import { KeyedCorrectnessRecordList } from '../../sys/sys-internal-api';
import { FeedTableRecordDefinition } from './feed-table-record-definition';
import { SingleDataItemRecordTableRecordSource } from './single-data-item-record-table-record-source';
import { TableRecordDefinition } from './table-record-definition';
import { TableRecordSource } from './table-record-source';

export class FeedTableRecordSource extends SingleDataItemRecordTableRecordSource<Feed> {
    private static _constructCount = 0;

    constructor(private _adi: AdiService) {
        super(TableRecordSource.TypeId.Feed);
        this.setName(FeedTableRecordSource.createName());
        this._changeDefinitionOrderAllowed = true;
    }

    private static createName() {
        const constructCountAsStr = (++FeedTableRecordSource._constructCount).toString(10);
        return FeedTableRecordSource.baseName + constructCountAsStr;
    }

    protected subscribeList() {
        const definition = new FeedsDataDefinition();
        const dataItem = this._adi.subscribe(definition) as FeedsDataItem;
        super.setSingleDataItem(dataItem);
        return dataItem;
    }

    protected unsubscribeList(list: KeyedCorrectnessRecordList<Feed>) {
        this._adi.unsubscribe(this.singleDataItem);
    }

    protected createTableRecordDefinition(record: Feed): FeedTableRecordDefinition {
        return {
            typeId: TableRecordDefinition.TypeId.Feed,
            mapKey: record.mapKey,
            record,
        };
    }
}

export namespace FeedTableRecordSource {
    export const baseName = 'Feed';
}
