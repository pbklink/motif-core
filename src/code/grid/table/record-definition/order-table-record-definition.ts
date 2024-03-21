/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Order } from '../../../adi/adi-internal-api';
import { TypedTableFieldSourceDefinition } from '../field-source/grid-table-field-source-internal-api';
import { BrokerageAccountRecordTableRecordDefinition } from './brokerage-account-record-table-record-definition';
import { TypedTableRecordDefinition } from './typed-table-record-definition';

export interface OrderTableRecordDefinition extends BrokerageAccountRecordTableRecordDefinition<Order> {
    readonly typeId: TypedTableFieldSourceDefinition.TypeId.Order;
}

export namespace OrderTableRecordDefinition {
    export function is(definition: TypedTableRecordDefinition): definition is OrderTableRecordDefinition {
        return definition.typeId === TypedTableFieldSourceDefinition.TypeId.Order;
    }
}
