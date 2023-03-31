/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IndexedTableRecordDefinition } from '../indexed-table-record-definition';
import { TableRecordDefinition } from '../table-record-definition';
import { EditableGridLayoutDefinitionColumn } from './editable-grid-layout-definition-column';

export interface EditableGridLayoutDefinitionColumnTableRecordDefinition extends IndexedTableRecordDefinition<EditableGridLayoutDefinitionColumn> {
    readonly typeId: TableRecordDefinition.TypeId.GridLayoutDefinitionColumn;
}

export namespace EditableGridLayoutDefinitionColumnTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is EditableGridLayoutDefinitionColumnTableRecordDefinition {
        return definition.typeId === TableRecordDefinition.TypeId.GridLayoutDefinitionColumn;
    }
}
