/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CallPut } from '../../../services/services-internal-api';
import { TableRecordDefinition } from './table-record-definition';

export interface CallPutTableRecordDefinition extends TableRecordDefinition {
    readonly typeId: TableRecordDefinition.TypeId.CallPut;
    readonly record: CallPut;
}

export namespace CallPutTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is CallPutTableRecordDefinition {
        return definition.typeId === TableRecordDefinition.TypeId.CallPut;
    }
}

