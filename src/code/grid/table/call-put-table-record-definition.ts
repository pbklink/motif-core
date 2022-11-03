/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CallPut } from '../../services/services-internal-api';
import { RecordTableRecordDefinition } from './record-table-record-definition';
import { TableRecordDefinition } from './table-record-definition';

export interface CallPutTableRecordDefinition extends RecordTableRecordDefinition<CallPut> {
    readonly typeId: TableRecordDefinition.TypeId.CallPut;
}

export namespace CallPutTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is CallPutTableRecordDefinition {
        return definition.typeId === TableRecordDefinition.TypeId.CallPut;
    }
}

