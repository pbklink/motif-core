/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TopShareholder } from 'src/code/adi/adi-internal-api';
import { TableRecordDefinition } from './table-record-definition';

export interface TopShareholderTableRecordDefinition extends TableRecordDefinition {
    readonly typeId: TableRecordDefinition.TypeId.TopShareholder;
    readonly record: TopShareholder;
}

export namespace TopShareholderTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is TopShareholderTableRecordDefinition {
        return definition.typeId === TableRecordDefinition.TypeId.TopShareholder;
    }
}
