/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Holding } from '../../../adi/internal-api';
import { TableFieldSourceDefinition } from '../field-source/internal-api';
import { BrokerageAccountRecordTableRecordDefinition } from './brokerage-account-record-table-record-definition';
import { TableRecordDefinition } from './table-record-definition';

export interface HoldingTableRecordDefinition extends BrokerageAccountRecordTableRecordDefinition<Holding> {
    readonly typeId: TableFieldSourceDefinition.TypeId.Holding;
}

export namespace HoldingTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is HoldingTableRecordDefinition {
        return definition.typeId === TableFieldSourceDefinition.TypeId.Holding;
    }
}
