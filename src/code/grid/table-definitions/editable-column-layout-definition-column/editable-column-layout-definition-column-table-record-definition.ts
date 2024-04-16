/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IndexedTableRecordDefinition, TableFieldSourceDefinition, TableRecordDefinition } from '../../table/internal-api';
import { EditableColumnLayoutDefinitionColumn } from './editable-column-layout-definition-column';

export interface EditableColumnLayoutDefinitionColumnTableRecordDefinition extends IndexedTableRecordDefinition<EditableColumnLayoutDefinitionColumn> {
    readonly typeId: TableFieldSourceDefinition.TypeId.EditableColumnLayoutDefinitionColumn;
}

export namespace EditableColumnLayoutDefinitionColumnTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is EditableColumnLayoutDefinitionColumnTableRecordDefinition {
        return definition.typeId === TableFieldSourceDefinition.TypeId.EditableColumnLayoutDefinitionColumn;
    }
}
