/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { PickEnum } from '../../../sys/internal-api';
import { GridFieldCustomHeadingsService } from '../../field/grid-field-internal-api';
import { GridLayoutDefinition } from '../../layout/grid-layout-internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionCachedFactoryService, TableRecordSourceDefinition } from '../../table/internal-api';
import { EditableGridLayoutDefinitionColumn } from './editable-grid-layout-definition-column';
import { EditableGridLayoutDefinitionColumnList } from './editable-grid-layout-definition-column-list';
import { EditableGridLayoutDefinitionColumnTableFieldSourceDefinition } from './editable-grid-layout-definition-column-table-field-source-definition';

/** @public */
export class EditableGridLayoutDefinitionColumnTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachedFactoryService: TableFieldSourceDefinitionCachedFactoryService,
        readonly list: EditableGridLayoutDefinitionColumnList,
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachedFactoryService,
            TableRecordSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn,
            EditableGridLayoutDefinitionColumnTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    // no override for saveToJson()

    override createDefaultLayoutDefinition() {
        const fieldSourceDefinition = EditableGridLayoutDefinitionColumnTableFieldSourceDefinition.getRegistered(this.tableFieldSourceDefinitionCachedFactoryService);

        const fieldNames = new Array<string>();

        fieldNames.push(fieldSourceDefinition.getFieldNameById(EditableGridLayoutDefinitionColumn.FieldId.FieldHeading));
        fieldNames.push(fieldSourceDefinition.getFieldNameById(EditableGridLayoutDefinitionColumn.FieldId.FieldSourceName));
        fieldNames.push(fieldSourceDefinition.getFieldNameById(EditableGridLayoutDefinitionColumn.FieldId.Width));
        fieldNames.push(fieldSourceDefinition.getFieldNameById(EditableGridLayoutDefinitionColumn.FieldId.Visible));

        return GridLayoutDefinition.createFromFieldNames(fieldNames);
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
