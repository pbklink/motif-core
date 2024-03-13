/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Order } from '../../../adi/adi-internal-api';
import { TableFieldSourceDefinition } from '../field-source/grid-table-field-source-internal-api';
import { BrokerageAccountRecordTableRecordDefinition } from './brokerage-account-record-table-record-definition';
import { TableRecordDefinition } from './table-record-definition';

export interface OrderTableRecordDefinition extends BrokerageAccountRecordTableRecordDefinition<Order> {
    readonly typeId: TableFieldSourceDefinition.TypeId.Order;
}

export namespace OrderTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is OrderTableRecordDefinition {
        return definition.typeId === TableFieldSourceDefinition.TypeId.Order;
    }
}
