/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CallPut } from '../../../services/services-internal-api';
import { TypedTableFieldSourceDefinition } from '../field-source/grid-table-field-source-internal-api';
import { TypedTableRecordDefinition } from './typed-table-record-definition';

export interface CallPutTableRecordDefinition extends TypedTableRecordDefinition {
    readonly typeId: TypedTableFieldSourceDefinition.TypeId.CallPut;
    readonly record: CallPut;
}

export namespace CallPutTableRecordDefinition {
    export function is(definition: TypedTableRecordDefinition): definition is CallPutTableRecordDefinition {
        return definition.typeId === TypedTableFieldSourceDefinition.TypeId.CallPut;
    }
}

