/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account } from '../../../adi/adi-internal-api';
import { RecordTableRecordDefinition } from './record-table-record-definition';
import { TableRecordDefinition } from './table-record-definition';

export interface BrokerageAccountTableRecordDefinition extends RecordTableRecordDefinition<Account> {
    readonly typeId: TableRecordDefinition.TypeId.BrokerageAccount;
}

export namespace BrokerageAccountTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is BrokerageAccountTableRecordDefinition {
        return definition.typeId === TableRecordDefinition.TypeId.BrokerageAccount;
    }
}
