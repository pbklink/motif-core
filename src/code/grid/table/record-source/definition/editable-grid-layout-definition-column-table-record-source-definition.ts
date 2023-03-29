/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { PickEnum } from '../../../../sys/sys-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionRegistryService } from '../../field-source/grid-table-field-source-internal-api';
import { EditableGridLayoutDefinitionColumn } from '../../record-definition/grid-table-record-definition-internal-api';
import { EditableGridLayoutDefinitionColumnList } from './editable-grid-layout-definition-column-list';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class EditableGridLayoutDefinitionColumnTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(
        tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        readonly list: EditableGridLayoutDefinitionColumnList,
    ) {
        super(
            tableFieldSourceDefinitionRegistryService,
            TableRecordSourceDefinition.TypeId.GridLayoutDefinitionColumnEditRecord,
            EditableGridLayoutDefinitionColumnTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    // no override for saveToJson()

    override createDefaultLayoutDefinition() {
        const fieldSourceDefinition = this.fieldSourceDefinitionRegistryService.editableGridLayoutDefinitionColumn;

        const fieldNames = new Array<string>();

        fieldNames.push(fieldSourceDefinition.getFieldNameById(EditableGridLayoutDefinitionColumn.FieldId.FieldHeading));
        fieldNames.push(fieldSourceDefinition.getFieldNameById(EditableGridLayoutDefinitionColumn.FieldId.FieldSourceName));
        fieldNames.push(fieldSourceDefinition.getFieldNameById(EditableGridLayoutDefinitionColumn.FieldId.Width));
        fieldNames.push(fieldSourceDefinition.getFieldNameById(EditableGridLayoutDefinitionColumn.FieldId.Visible));

        const columns = this.createGridLayoutDefinitionColumnsFromFieldNames(fieldNames);
        return new GridLayoutDefinition(columns);
    }
}

/** @public */
export namespace EditableGridLayoutDefinitionColumnTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn,
    ];
}
