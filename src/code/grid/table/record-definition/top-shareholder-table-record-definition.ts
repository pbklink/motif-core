/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TopShareholder } from '../../../adi/adi-internal-api';
import { TableFieldSourceDefinition } from '../field-source/grid-table-field-source-internal-api';
import { TableRecordDefinition } from './table-record-definition';

export interface TopShareholderTableRecordDefinition extends TableRecordDefinition {
    readonly typeId: TableFieldSourceDefinition.TypeId.TopShareholder;
    readonly record: TopShareholder;
}

export namespace TopShareholderTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is TopShareholderTableRecordDefinition {
        return definition.typeId === TableFieldSourceDefinition.TypeId.TopShareholder;
    }
}
