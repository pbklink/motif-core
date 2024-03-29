/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AllBrokerageAccountRecordsDataItem } from './all-brokerage-account-records-data-item';
import { Balances } from './balances';
import { BrokerageAccountGroupRecordList } from './brokerage-account-group-record-list';
import { BrokerageAccountBalancesDataDefinition } from './common/internal-api';

export class AllBalancesDataItem extends AllBrokerageAccountRecordsDataItem<Balances> implements BrokerageAccountGroupRecordList<Balances> {

    protected createRecordsDataDefinition() {
        return new BrokerageAccountBalancesDataDefinition();
    }
}
