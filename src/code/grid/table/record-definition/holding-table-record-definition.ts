/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Holding } from '../../../adi/adi-internal-api';
import { TypedTableFieldSourceDefinition } from '../field-source/grid-table-field-source-internal-api';
import { BrokerageAccountRecordTableRecordDefinition } from './brokerage-account-record-table-record-definition';
import { TypedTableRecordDefinition } from './typed-table-record-definition';

export interface HoldingTableRecordDefinition extends BrokerageAccountRecordTableRecordDefinition<Holding> {
    readonly typeId: TypedTableFieldSourceDefinition.TypeId.Holding;
}

export namespace HoldingTableRecordDefinition {
    export function is(definition: TypedTableRecordDefinition): definition is HoldingTableRecordDefinition {
        return definition.typeId === TypedTableFieldSourceDefinition.TypeId.Holding;
    }
}
