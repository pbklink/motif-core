/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { PickEnum } from '../../../sys/internal-api';
import { GridFieldCustomHeadingsService } from '../../field/internal-api';
import { GridLayoutDefinition } from '../../layout/internal-api';
import { TypedTableFieldSourceDefinition, TypedTableFieldSourceDefinitionCachingFactoryService, TypedTableRecordSourceDefinition } from '../../table/internal-api';
import { EditableGridLayoutDefinitionColumn } from './editable-grid-layout-definition-column';
import { EditableGridLayoutDefinitionColumnList } from './editable-grid-layout-definition-column-list';
import { EditableGridLayoutDefinitionColumnTableFieldSourceDefinition } from './editable-grid-layout-definition-column-table-field-source-definition';

/** @public */
export class EditableGridLayoutDefinitionColumnTableRecordSourceDefinition extends TypedTableRecordSourceDefinition {
    constructor(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService,
        readonly list: EditableGridLayoutDefinitionColumnList,
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            TypedTableRecordSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn,
            EditableGridLayoutDefinitionColumnTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    // no override for saveToJson()

    override createDefaultLayoutDefinition() {
        const fieldSourceDefinition = EditableGridLayoutDefinitionColumnTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactoryService);

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
    export type FieldSourceDefinitionTypeId = PickEnum<TypedTableFieldSourceDefinition.TypeId,
        TypedTableFieldSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TypedTableFieldSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TypedTableFieldSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn,
    ];
}
