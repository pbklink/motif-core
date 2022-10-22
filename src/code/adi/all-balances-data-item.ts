/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AllBrokerageAccountRecordsDataItem } from './all-brokerage-account-records-data-item';
import { Balances } from './balances';
import { BrokerageAccountGroupBalancesList } from './brokerage-account-group-balances-list';
import { BrokerageAccountBalancesDataDefinition } from './common/adi-common-internal-api';

export class AllBalancesDataItem extends AllBrokerageAccountRecordsDataItem<Balances> implements BrokerageAccountGroupBalancesList {

    protected createRecordsDataDefinition() {
        return new BrokerageAccountBalancesDataDefinition();
    }
}
