/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Scan } from '../../../scan/internal-api';
import { TableFieldSourceDefinition } from '../field-source/grid-table-field-source-internal-api';
import { PayloadTableRecordDefinition } from './payload-table-record-definition';
import { TableRecordDefinition } from './table-record-definition';

export interface ScanTableRecordDefinition extends PayloadTableRecordDefinition<Scan> {
    readonly typeId: TableFieldSourceDefinition.TypeId.Scan;
}

export namespace ScanTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is ScanTableRecordDefinition {
        return definition.typeId === TableFieldSourceDefinition.TypeId.Scan;
    }
}
