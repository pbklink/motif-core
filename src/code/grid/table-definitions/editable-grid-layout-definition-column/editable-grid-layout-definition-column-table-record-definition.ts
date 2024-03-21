/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IndexedTableRecordDefinition, TypedTableFieldSourceDefinition, TypedTableRecordDefinition } from '../../table/internal-api';
import { EditableGridLayoutDefinitionColumn } from './editable-grid-layout-definition-column';

export interface EditableGridLayoutDefinitionColumnTableRecordDefinition extends IndexedTableRecordDefinition<EditableGridLayoutDefinitionColumn> {
    readonly typeId: TypedTableFieldSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn;
}

export namespace EditableGridLayoutDefinitionColumnTableRecordDefinition {
    export function is(definition: TypedTableRecordDefinition): definition is EditableGridLayoutDefinitionColumnTableRecordDefinition {
        return definition.typeId === TypedTableFieldSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn;
    }
}
