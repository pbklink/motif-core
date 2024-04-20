/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevColumnLayoutDefinition, RevSourcedFieldCustomHeadingsService } from '@xilytix/revgrid';
import { PickEnum } from '../../../sys/internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionCachingFactoryService, TableRecordSourceDefinition } from '../../table/internal-api';
import { EditableColumnLayoutDefinitionColumn } from './editable-column-layout-definition-column';
import { EditableColumnLayoutDefinitionColumnList } from './editable-column-layout-definition-column-list';
import { EditableColumnLayoutDefinitionColumnTableFieldSourceDefinition } from './editable-column-layout-definition-column-table-field-source-definition';

/** @public */
export class EditableColumnLayoutDefinitionColumnTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(
        customHeadingsService: RevSourcedFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TableFieldSourceDefinitionCachingFactoryService,
        readonly list: EditableColumnLayoutDefinitionColumnList,
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            TableRecordSourceDefinition.TypeId.EditableColumnLayoutDefinitionColumn,
            EditableColumnLayoutDefinitionColumnTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    // no override for saveToJson()

    override createDefaultLayoutDefinition() {
        const fieldSourceDefinition = EditableColumnLayoutDefinitionColumnTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactoryService);

        const fieldNames = new Array<string>();

        fieldNames.push(fieldSourceDefinition.getFieldNameById(EditableColumnLayoutDefinitionColumn.FieldId.FieldHeading));
        fieldNames.push(fieldSourceDefinition.getFieldNameById(EditableColumnLayoutDefinitionColumn.FieldId.FieldSourceName));
        fieldNames.push(fieldSourceDefinition.getFieldNameById(EditableColumnLayoutDefinitionColumn.FieldId.Width));
        fieldNames.push(fieldSourceDefinition.getFieldNameById(EditableColumnLayoutDefinitionColumn.FieldId.Visible));

        return RevColumnLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace EditableColumnLayoutDefinitionColumnTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.EditableColumnLayoutDefinitionColumn
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.EditableColumnLayoutDefinitionColumn,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.EditableColumnLayoutDefinitionColumn,
    ];
}