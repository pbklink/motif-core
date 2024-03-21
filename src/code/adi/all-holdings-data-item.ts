/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AllBrokerageAccountRecordsDataItem } from './all-brokerage-account-records-data-item';
import { BrokerageAccountGroupHoldingList } from './brokerage-account-group-holding-list';
import { BrokerageAccountHoldingsDataDefinition } from './common/internal-api';
import { Holding } from './holding';

export class AllHoldingsDataItem extends AllBrokerageAccountRecordsDataItem<Holding> implements BrokerageAccountGroupHoldingList {

    protected createRecordsDataDefinition() {
        return new BrokerageAccountHoldingsDataDefinition();
    }
}
