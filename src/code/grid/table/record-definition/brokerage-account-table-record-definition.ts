/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account } from '../../../adi/adi-internal-api';
import { TypedTableFieldSourceDefinition } from '../field-source/grid-table-field-source-internal-api';
import { KeyedCorrectnessTableRecordDefinition } from './keyed-correctness-table-record-definition';
import { TypedTableRecordDefinition } from './typed-table-record-definition';

export interface BrokerageAccountTableRecordDefinition extends KeyedCorrectnessTableRecordDefinition<Account> {
    readonly typeId: TypedTableFieldSourceDefinition.TypeId.BrokerageAccount;
}

export namespace BrokerageAccountTableRecordDefinition {
    export function is(definition: TypedTableRecordDefinition): definition is BrokerageAccountTableRecordDefinition {
        return definition.typeId === TypedTableFieldSourceDefinition.TypeId.BrokerageAccount;
    }
}
