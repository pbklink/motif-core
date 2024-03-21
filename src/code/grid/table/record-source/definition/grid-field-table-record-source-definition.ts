/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { PickEnum } from '../../../../sys/internal-api';
import { GridField, GridFieldCustomHeadingsService } from '../../../field/internal-api';
import { GridLayoutDefinition } from '../../../layout/internal-api';
import { GridFieldTableFieldSourceDefinition, TypedTableFieldSourceDefinition, TypedTableFieldSourceDefinitionCachingFactoryService } from '../../field-source/internal-api';
import { TypedTableRecordSourceDefinition } from './typed-table-record-source-definition';

/** @public */
export class GridFieldTableRecordSourceDefinition extends TypedTableRecordSourceDefinition {
    constructor(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService,
        private readonly _gridFieldArray: GridField[],
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            TypedTableRecordSourceDefinition.TypeId.GridField,
            GridFieldTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    get gridFieldArray() { return this._gridFieldArray; }

    override createDefaultLayoutDefinition() {
        const gridFieldFieldSourceDefinition = GridFieldTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactoryService);

        const fieldNames = new Array<string>();

        fieldNames.push(gridFieldFieldSourceDefinition.getSupportedFieldNameById(GridField.FieldId.Heading));
        fieldNames.push(gridFieldFieldSourceDefinition.getSupportedFieldNameById(GridField.FieldId.SourceName));

        return GridLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace GridFieldTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TypedTableFieldSourceDefinition.TypeId,
        TypedTableFieldSourceDefinition.TypeId.GridField
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TypedTableFieldSourceDefinition.TypeId.GridField,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TypedTableFieldSourceDefinition.TypeId.GridField,
    ];

    export namespace JsonName {
        export const gridFieldId = 'gridFieldId';
    }
}
