/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BrokerageAccountGroup } from '../../../../adi/adi-internal-api';
import { JsonElement, Ok, Result } from '../../../../sys/sys-internal-api';
import { BrokerageAccountGroupTableRecordSourceDefinition } from './brokerage-account-group-table-record-source-definition';
import { TableRecordSourceDefinition } from './table-record-source-definition';

export class OrderTableRecordSourceDefinition extends BrokerageAccountGroupTableRecordSourceDefinition {
    constructor(brokerageAccountGroup: BrokerageAccountGroup) {
        super(TableRecordSourceDefinition.TypeId.Order, brokerageAccountGroup);
    }
}

export namespace OrderTableRecordSourceDefinition {
    export function tryCreateFromJson(element: JsonElement): Result<OrderTableRecordSourceDefinition> {
        const group = BrokerageAccountGroupTableRecordSourceDefinition.getBrokerageAccountGroupFromJson(element);
        const definition = new OrderTableRecordSourceDefinition(group);
        return new Ok(definition);
    }
}
