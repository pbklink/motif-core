/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService, AllOrdersDataDefinition,
    AllOrdersDataItem,
    BrokerageAccountGroup, BrokerageAccountGroupOrderList, BrokerageAccountGroupRecordList, BrokerageAccountOrdersDataDefinition,
    BrokerageAccountOrdersDataItem,
    Order,

    SingleBrokerageAccountGroup
} from '../../adi/adi-internal-api';
import { UnreachableCaseError } from '../../sys/sys-internal-api';
import {
    BrokerageAccountGroupRecordTableRecordSource
} from './brokerage-account-group-record-table-record-source';
import { OrderTableRecordDefinition } from './order-table-record-definition';
import { TableRecordDefinition } from './table-record-definition';
import { TableRecordSource } from './table-record-source';

export class OrderTableRecordSource extends BrokerageAccountGroupRecordTableRecordSource<Order> {
    private static _constructCount = 0;

    constructor(private _adi: AdiService) {
        super(TableRecordSource.TypeId.Order);
        this.setName(OrderTableRecordSource.createName());
        this._changeDefinitionOrderAllowed = true;
    }

    override get recordList() { return super.recordList as BrokerageAccountGroupOrderList; }

    private static createName() {
        return OrderTableRecordSource.baseName + (++OrderTableRecordSource._constructCount).toString(10);
    }

    protected subscribeList(): BrokerageAccountGroupRecordList<Order> {
        switch (this.brokerageAccountGroup.typeId) {
            case BrokerageAccountGroup.TypeId.Single: {
                const brokerageAccountGroup = this.brokerageAccountGroup as SingleBrokerageAccountGroup;
                const definition = new BrokerageAccountOrdersDataDefinition();
                definition.accountId = brokerageAccountGroup.accountKey.id;
                definition.environmentId = brokerageAccountGroup.accountKey.environmentId;
                const dataItem = this._adi.subscribe(definition) as BrokerageAccountOrdersDataItem;
                this.setSingleDataItem(dataItem);
                return dataItem;
            }

            case BrokerageAccountGroup.TypeId.All: {
                const definition = new AllOrdersDataDefinition();
                const dataItem = this._adi.subscribe(definition) as AllOrdersDataItem;
                this.setSingleDataItem(dataItem);
                return dataItem;
            }

            default:
                throw new UnreachableCaseError('OTRDLSDI19999834346', this.brokerageAccountGroup.typeId);
        }
    }

    protected unsubscribeList(list: BrokerageAccountGroupRecordList<Order>) {
        this._adi.unsubscribe(this.singleDataItem);
    }

    protected createTableRecordDefinition(record: Order): OrderTableRecordDefinition {
        return {
            typeId: TableRecordDefinition.TypeId.Order,
            mapKey: record.mapKey,
            record,
        }
    }
}

export namespace OrderTableRecordSource {
    export const baseName = 'Order';
}
