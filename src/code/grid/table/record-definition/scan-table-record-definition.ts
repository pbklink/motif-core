/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Scan } from '../../../scan/internal-api';
import { TypedTableFieldSourceDefinition } from '../field-source/internal-api';
import { PayloadTableRecordDefinition } from './payload-table-record-definition';
import { TypedTableRecordDefinition } from './typed-table-record-definition';

export interface ScanTableRecordDefinition extends PayloadTableRecordDefinition<Scan> {
    readonly typeId: TypedTableFieldSourceDefinition.TypeId.Scan;
}

export namespace ScanTableRecordDefinition {
    export function is(definition: TypedTableRecordDefinition): definition is ScanTableRecordDefinition {
        return definition.typeId === TypedTableFieldSourceDefinition.TypeId.Scan;
    }
}
