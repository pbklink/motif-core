/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Balances } from '../../../adi/internal-api';
import { TypedTableFieldSourceDefinition } from '../field-source/internal-api';
import { BrokerageAccountRecordTableRecordDefinition } from './brokerage-account-record-table-record-definition';
import { TypedTableRecordDefinition } from './typed-table-record-definition';

export interface BalancesTableRecordDefinition extends BrokerageAccountRecordTableRecordDefinition<Balances> {
    readonly typeId: TypedTableFieldSourceDefinition.TypeId.Balances;
}

export namespace BalancesTableRecordDefinition {
    export function is(definition: TypedTableRecordDefinition): definition is BalancesTableRecordDefinition {
        return definition.typeId === TypedTableFieldSourceDefinition.TypeId.Balances;
    }
}
