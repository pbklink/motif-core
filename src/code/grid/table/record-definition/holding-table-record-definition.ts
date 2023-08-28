/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Holding } from '../../../adi/adi-internal-api';
import { BrokerageAccountRecordTableRecordDefinition } from './brokerage-account-record-table-record-definition';
import { TableRecordDefinition } from './table-record-definition';

export interface HoldingTableRecordDefinition extends BrokerageAccountRecordTableRecordDefinition<Holding> {
    readonly typeId: TableRecordDefinition.TypeId.Holding;
}

export namespace HoldingTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is HoldingTableRecordDefinition {
        return definition.typeId === TableRecordDefinition.TypeId.Holding;
    }
}
