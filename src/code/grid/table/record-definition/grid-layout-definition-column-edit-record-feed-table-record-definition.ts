/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    GridLayoutDefinitionColumnEditRecord
} from "../../layout/definition/column-edit-record/grid-layout-definition-column-edit-record-internal-api";
import { IndexedTableRecordDefinition } from './indexed-table-record-definition';
import { TableRecordDefinition } from './table-record-definition';

export interface GridLayoutDefinitionColumnEditRecordTableRecordDefinition extends IndexedTableRecordDefinition<GridLayoutDefinitionColumnEditRecord> {
    readonly typeId: TableRecordDefinition.TypeId.GridLayoutDefinitionColumnEditRecord;
}

export namespace GridLayoutDefinitionColumnEditRecordTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is GridLayoutDefinitionColumnEditRecordTableRecordDefinition {
        return definition.typeId === TableRecordDefinition.TypeId.GridLayoutDefinitionColumnEditRecord;
    }
}
