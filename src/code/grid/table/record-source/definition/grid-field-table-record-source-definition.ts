/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { PickEnum } from '../../../../sys/sys-internal-api';
import { GridField, GridFieldCustomHeadingsService } from '../../../field/grid-field-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionRegistryService } from '../../field-source/grid-table-field-source-internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class GridFieldTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        private readonly _gridFieldArray: GridField[],
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionRegistryService,
            TableRecordSourceDefinition.TypeId.GridField,
            GridFieldTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    get gridFieldArray() { return this._gridFieldArray; }

    override createDefaultLayoutDefinition() {
        const gridFieldFieldSourceDefinition = this.fieldSourceDefinitionRegistryService.gridField;

        const fieldNames = new Array<string>();

        fieldNames.push(gridFieldFieldSourceDefinition.getSupportedFieldNameById(GridField.FieldId.Heading));
        fieldNames.push(gridFieldFieldSourceDefinition.getSupportedFieldNameById(GridField.FieldId.SourceName));

        return GridLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace GridFieldTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.GridField
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.GridField,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.GridField,
    ];

    export namespace JsonName {
        export const gridFieldId = 'gridFieldId';
    }
}
