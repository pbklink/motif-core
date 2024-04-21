/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevColumnLayoutDefinition, RevSourcedField, RevSourcedFieldCustomHeadingsService } from '@xilytix/revgrid';
import { PickEnum } from '../../../../sys/internal-api';
import { GridField } from '../../../field/internal-api';
import { GridFieldTableFieldSourceDefinition, TableFieldSourceDefinition, TableFieldSourceDefinitionCachingFactoryService } from '../../field-source/internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class GridFieldTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(
        customHeadingsService: RevSourcedFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TableFieldSourceDefinitionCachingFactoryService,
        private readonly _gridFieldArray: GridField[],
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            TableRecordSourceDefinition.TypeId.GridField,
            GridFieldTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    get gridFieldArray() { return this._gridFieldArray; }

    override createDefaultLayoutDefinition() {
        const gridFieldFieldSourceDefinition = GridFieldTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactoryService);

        const fieldNames = new Array<string>();

        fieldNames.push(gridFieldFieldSourceDefinition.getSupportedFieldNameById(RevSourcedField.FieldId.Heading));
        fieldNames.push(gridFieldFieldSourceDefinition.getSupportedFieldNameById(RevSourcedField.FieldId.SourceName));

        return RevColumnLayoutDefinition.createFromFieldNames(fieldNames);
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
