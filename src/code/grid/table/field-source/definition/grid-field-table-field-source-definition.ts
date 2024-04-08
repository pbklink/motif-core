/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevField } from '@xilytix/rev-data-source';
import { AssertInternalError, GridFieldHorizontalAlign, Integer } from '../../../../sys/internal-api';
import { GridField } from '../../../field/internal-api';
import {
    StringTableField,
    TableField
} from "../../field/internal-api";
import {
    StringTableValue,
    TableValue
} from '../../value/internal-api';
import { TableFieldSourceDefinition } from './table-field-source-definition';
import { TableFieldSourceDefinitionCachingFactoryService } from './table-field-source-definition-caching-factory-service';

/** @public */
export class GridFieldTableFieldSourceDefinition extends TableFieldSourceDefinition {
    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(GridFieldTableFieldSourceDefinition.typeId);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: RevField.FieldId) {
        return GridFieldTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: RevField.FieldId) {
        const sourcelessFieldName = GridField.Field.idToName(id);
        return this.encodeFieldName(sourcelessFieldName);
    }

    getSupportedFieldNameById(id: RevField.FieldId) {
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
            const textAlign = GridFieldTableFieldSourceDefinition.Field.getHorizontalAlign(fieldIdx);
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
    export const typeId = TableFieldSourceDefinition.TypeId.GridField;
    export type TypeId = typeof typeId;

    export namespace Field {
        const unsupportedIds: RevField.FieldId[] = [RevField.FieldId.DefaultHeading, RevField.FieldId.DefaultWidth, RevField.FieldId.DefaultTextAlign];
        export const count = GridField.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: RevField.FieldId;
            readonly tableFieldValueConstructors: [field: TableField.Constructor, value: TableValue.Constructor];
        }

        const infos: Info[] = [
            {
                id: RevField.FieldId.Name,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: RevField.FieldId.Heading,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: RevField.FieldId.SourceName,
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

        export function isIdSupported(id: RevField.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function indexOfId(id: RevField.FieldId) {
            return idFieldIndices[id];
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return GridField.Field.idToName(infos[fieldIdx].id);
        }

        export function getHeading(fieldIdx: Integer) {
            return GridField.idToHeading(infos[fieldIdx].id);
        }

        export function getHorizontalAlign(fieldIdx: Integer): GridFieldHorizontalAlign {
            return GridField.Field.idToHorizontalAlign(infos[fieldIdx].id);
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
        sourceTypeId: GridFieldTableFieldSourceDefinition.TypeId;
        id: RevField.FieldId;
    }

    export function get(cachingFactoryService: TableFieldSourceDefinitionCachingFactoryService): GridFieldTableFieldSourceDefinition {
        return cachingFactoryService.get(typeId) as GridFieldTableFieldSourceDefinition;
    }

    export function initialiseStatic() {
        Field.initialise();
    }
}
