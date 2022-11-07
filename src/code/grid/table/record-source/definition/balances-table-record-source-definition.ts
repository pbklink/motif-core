/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BrokerageAccountGroup } from '../../../../adi/adi-internal-api';
import { JsonElement } from '../../../../sys/sys-internal-api';
import { BrokerageAccountGroupTableRecordSourceDefinition } from './brokerage-account-group-table-record-source-definition';
import { TableRecordSourceDefinition } from './table-record-source-definition';

export class BalancesTableRecordSourceDefinition extends BrokerageAccountGroupTableRecordSourceDefinition {
    constructor(brokerageAccountGroup: BrokerageAccountGroup) {
        super(TableRecordSourceDefinition.TypeId.Balances, brokerageAccountGroup);
    }
}

export namespace BalancesTableRecordSourceDefinition {
    export function createFromJson(
        element: JsonElement
    ): BalancesTableRecordSourceDefinition {
        const group = BrokerageAccountGroupTableRecordSourceDefinition.getBrokerageAccountGroupFromJson(element);
        return new BalancesTableRecordSourceDefinition(group);
    }
}
