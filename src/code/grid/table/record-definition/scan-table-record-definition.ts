/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Scan } from '../../../scan/scan-internal-api';
import { KeyedCorrectnessSettableTableRecordDefinition } from './keyed-correctness-settable-table-record-definition';
import { TableRecordDefinition } from './table-record-definition';

export interface ScanTableRecordDefinition extends KeyedCorrectnessSettableTableRecordDefinition<Scan> {
    readonly typeId: TableRecordDefinition.TypeId.Scan;
}

export namespace ScanTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is ScanTableRecordDefinition {
        return definition.typeId === TableRecordDefinition.TypeId.Scan;
    }
}
