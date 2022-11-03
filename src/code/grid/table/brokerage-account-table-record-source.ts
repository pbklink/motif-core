/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account, AdiService, BrokerageAccountsDataDefinition, BrokerageAccountsDataItem } from '../../adi/adi-internal-api';
import { KeyedCorrectnessRecordList } from '../../sys/sys-internal-api';
import { BrokerageAccountTableRecordDefinition } from './brokerage-account-table-record-definition';
import { SingleDataItemRecordTableRecordSource } from './single-data-item-record-table-record-source';
import { TableRecordDefinition } from './table-record-definition';
import { TableRecordSource } from './table-record-source';

export class BrokerageAccountTableRecordSource extends SingleDataItemRecordTableRecordSource<Account> {
    private static _constructCount = 0;

    constructor(private _adi: AdiService) {
        super(TableRecordSource.TypeId.BrokerageAccount);
        this.setName(BrokerageAccountTableRecordSource.createName());
        this._changeDefinitionOrderAllowed = true;
    }

    private static createName() {
        const constructCountAsStr = (++BrokerageAccountTableRecordSource._constructCount).toString(10);
        return BrokerageAccountTableRecordSource.baseName + constructCountAsStr;
    }

    protected subscribeList() {
        const definition = new BrokerageAccountsDataDefinition();
        const dataItem = this._adi.subscribe(definition) as BrokerageAccountsDataItem;
        super.setSingleDataItem(dataItem);
        return dataItem;
    }

    protected unsubscribeList(list: KeyedCorrectnessRecordList<Account>) {
        this._adi.unsubscribe(this.singleDataItem);
    }

    protected createTableRecordDefinition(record: Account): BrokerageAccountTableRecordDefinition {
        return {
            typeId: TableRecordDefinition.TypeId.BrokerageAccount,
            mapKey:record.mapKey,
            record,
        };
    }
}

export namespace BrokerageAccountTableRecordSource {
    export const baseName = 'BrokerageAccount';
}
