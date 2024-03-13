/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IndexedTableRecordDefinition, TableFieldSourceDefinition, TableRecordDefinition } from '../../table/internal-api';
import { EditableGridLayoutDefinitionColumn } from './editable-grid-layout-definition-column';

export interface EditableGridLayoutDefinitionColumnTableRecordDefinition extends IndexedTableRecordDefinition<EditableGridLayoutDefinitionColumn> {
    readonly typeId: TableFieldSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn;
}

export namespace EditableGridLayoutDefinitionColumnTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is EditableGridLayoutDefinitionColumnTableRecordDefinition {
        return definition.typeId === TableFieldSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn;
    }
}
