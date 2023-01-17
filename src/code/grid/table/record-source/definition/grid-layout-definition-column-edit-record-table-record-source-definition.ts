/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { PickEnum } from '../../../../sys/sys-internal-api';
import {
    GridLayoutDefinition,
    GridLayoutDefinitionColumnEditRecord,
    GridLayoutDefinitionColumnEditRecordList
} from "../../../layout/grid-layout-internal-api";
import { TableFieldSourceDefinition, TableFieldSourceDefinitionRegistryService } from '../../field-source/grid-table-field-source-internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class GridLayoutDefinitionColumnEditRecordTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(
        tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        readonly list: GridLayoutDefinitionColumnEditRecordList,
    ) {
        super(
            tableFieldSourceDefinitionRegistryService,
            TableRecordSourceDefinition.TypeId.GridLayoutDefinitionColumnEditRecord,
            GridLayoutDefinitionColumnEditRecordTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    // no override for saveToJson()

    override createDefaultLayoutDefinition() {
        const fieldSourceDefinition = this.fieldSourceDefinitionRegistryService.gridLayoutDefinitionColumnEditRecord;

        const fieldNames = new Array<string>();

        fieldNames.push(fieldSourceDefinition.getFieldNameById(GridLayoutDefinitionColumnEditRecord.FieldId.FieldHeading));
        fieldNames.push(fieldSourceDefinition.getFieldNameById(GridLayoutDefinitionColumnEditRecord.FieldId.FieldSourceName));
        fieldNames.push(fieldSourceDefinition.getFieldNameById(GridLayoutDefinitionColumnEditRecord.FieldId.Width));
        fieldNames.push(fieldSourceDefinition.getFieldNameById(GridLayoutDefinitionColumnEditRecord.FieldId.Visible));

        const columns = this.createGridLayoutDefinitionColumnsFromFieldNames(fieldNames);
        return new GridLayoutDefinition(columns);
    }
}

/** @public */
export namespace GridLayoutDefinitionColumnEditRecordTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.GridLayoutDefinitionColumnEditRecord
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.GridLayoutDefinitionColumnEditRecord,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.GridLayoutDefinitionColumnEditRecord,
    ];
}
