/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Balances } from '../../adi/adi-internal-api';
import { BrokerageAccountRecordTableRecordDefinition } from './brokerage-account-record-table-record-definition';
import { TableRecordDefinition } from './table-record-definition';

export interface BalancesTableRecordDefinition extends BrokerageAccountRecordTableRecordDefinition<Balances> {
    readonly typeId: TableRecordDefinition.TypeId.Balances;
}

export namespace BalancesTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is BalancesTableRecordDefinition {
        return definition.typeId === TableRecordDefinition.TypeId.Balances;
    }
}

