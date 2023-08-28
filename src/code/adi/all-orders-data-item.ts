/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AllBrokerageAccountRecordsDataItem } from './all-brokerage-account-records-data-item';
import { BrokerageAccountGroupOrderList } from './brokerage-account-group-order-list';
import { BrokerageAccountOrdersDataDefinition } from './common/adi-common-internal-api';
import { Order } from './order';

export class AllOrdersDataItem extends AllBrokerageAccountRecordsDataItem<Order> implements BrokerageAccountGroupOrderList {

    protected createRecordsDataDefinition() {
        return new BrokerageAccountOrdersDataDefinition();
    }
}
