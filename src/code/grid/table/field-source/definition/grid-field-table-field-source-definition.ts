/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, CommaText, FieldDataType, FieldDataTypeId, Integer } from '../../../../sys/internal-api';
import { GridField } from '../../../field/grid-field-internal-api';
import {
    StringTableField,
    TableField
} from "../../field/grid-table-field-internal-api";
import {
    StringTableValue,
    TableValue
} from '../../value/grid-table-value-internal-api';
import { TableFieldSourceDefinition } from './table-field-source-definition';

/** @public */
export class GridFieldTableFieldSourceDefinition extends TableFieldSourceDefinition {
    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(TableFieldSourceDefinition.TypeId.GridField);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: GridField.FieldId) {
        return GridFieldTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: GridField.FieldId) {
        const sourcelessFieldName = GridField.Field.idToName(id);
        return CommaText.from2Values(this.name, sourcelessFieldName);
    }

    getSupportedFieldNameById(id: GridField.FieldId) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('STFSDGSFNBI30398', GridField.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }

    private createFieldDefinitions() {
        const count = GridFieldTableFieldSourceDefinition.Field.count;
        const result = new Array<TableField.Definition>(count);

        for (let fieldIdx = 0; fieldIdx < count; fieldIdx++) {
            const sourcelessFieldName = GridFieldTableFieldSourceDefinition.Field.getName(fieldIdx);
            const heading = GridFieldTableFieldSourceDefinition.Field.getHeading(fieldIdx);
            const dataTypeId = GridFieldTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const [fieldConstructor, valueConstructor] =
                GridFieldTableFieldSourceDefinition.Field.getTableFieldValueConstructors(fieldIdx);

            result[fieldIdx] = new TableField.Definition(
                this,
                sourcelessFieldName,
                heading,
                textAlign,
                fieldConstructor,
                valueConstructor,
            );
        }

        return result;
    }
}

/** @public */
export namespace GridFieldTableFieldSourceDefinition {
    export namespace Field {
        const unsupportedIds: GridField.FieldId[] = [GridField.FieldId.DefaultHeading, GridField.FieldId.DefaultWidth, GridField.FieldId.DefaultTextAlign];
        export const count = GridField.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: GridField.FieldId;
            readonly tableFieldValueConstructors: [field: TableField.Constructor, value: TableValue.Constructor];
        }

        const infos: Info[] = [
            {
                id: GridField.FieldId.Name,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: GridField.FieldId.Heading,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: GridField.FieldId.SourceName,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
        ];

        const idFieldIndices = new Array<Integer>(count);

        export function initialise() {
            const idFieldIndexCount = idFieldIndices.length;
            for (let i = 0; i < idFieldIndexCount; i++) {
                idFieldIndices[i] = -1;
            }
            for (let fieldIndex = 0; fieldIndex < count; fieldIndex++) {
                const id = infos[fieldIndex].id;
                if (unsupportedIds.includes(id)) {
                    throw new AssertInternalError('STFSDFII42422', fieldIndex.toString());
                } else {
                    if (idFieldIndices[fieldIndex] !== -1) {
                        throw new AssertInternalError('STFSDFID42422', fieldIndex.toString()); // duplicate
                    } else {
                        idFieldIndices[fieldIndex] = fieldIndex;
                    }
                }
            }
        }

        export function isIdSupported(id: GridField.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function indexOfId(id: GridField.FieldId) {
            return idFieldIndices[id];
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return GridField.Field.idToName(infos[fieldIdx].id);
        }

        export function getHeading(fieldIdx: Integer) {
            return GridField.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return GridField.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableFieldValueConstructors(fieldIndex: Integer) {
            return infos[fieldIndex].tableFieldValueConstructors;
        }

        export function getTableValueConstructor(fieldIndex: Integer): TableValue.Constructor {
            const constructors = getTableFieldValueConstructors(fieldIndex);
            return constructors[1];
        }
    }

    export interface FieldId extends TableFieldSourceDefinition.FieldId {
        sourceTypeId: TableFieldSourceDefinition.TypeId.GridField;
        id: GridField.FieldId;
    }

    export function initialiseStatic() {
        Field.initialise();
    }
}
