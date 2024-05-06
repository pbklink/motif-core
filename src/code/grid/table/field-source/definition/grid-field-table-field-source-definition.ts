/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevHorizontalAlignId, RevSourcedField } from '@xilytix/revgrid';
import { AssertInternalError, Integer } from '../../../../sys/internal-api';
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
import { TableFieldSourceDefinitionCachingFactory } from './table-field-source-definition-caching-factory';

/** @public */
export class GridFieldTableFieldSourceDefinition extends TableFieldSourceDefinition {
    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(GridFieldTableFieldSourceDefinition.typeId);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: RevSourcedField.FieldId) {
        return GridFieldTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: RevSourcedField.FieldId) {
        const sourcelessFieldName = RevSourcedField.Field.idToName(id);
        return this.encodeFieldName(sourcelessFieldName);
    }

    getSupportedFieldNameById(id: RevSourcedField.FieldId) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('STFSDGSFNBI30398', RevSourcedField.Field.idToName(id));
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
            const textAlignId = GridFieldTableFieldSourceDefinition.Field.getHorizontalAlign(fieldIdx);
            const [fieldConstructor, valueConstructor] =
                GridFieldTableFieldSourceDefinition.Field.getTableFieldValueConstructors(fieldIdx);

            result[fieldIdx] = new TableField.Definition(
                this,
                sourcelessFieldName,
                heading,
                textAlignId,
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
        const unsupportedIds: RevSourcedField.FieldId[] = [RevSourcedField.FieldId.DefaultHeading, RevSourcedField.FieldId.DefaultWidth, RevSourcedField.FieldId.DefaultTextAlign];
        export const count = RevSourcedField.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: RevSourcedField.FieldId;
            readonly tableFieldValueConstructors: [field: TableField.Constructor, value: TableValue.Constructor];
        }

        const infos: Info[] = [
            {
                id: RevSourcedField.FieldId.Name,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: RevSourcedField.FieldId.Heading,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: RevSourcedField.FieldId.SourceName,
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

        export function isIdSupported(id: RevSourcedField.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function indexOfId(id: RevSourcedField.FieldId) {
            return idFieldIndices[id];
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return RevSourcedField.Field.idToName(infos[fieldIdx].id);
        }

        export function getHeading(fieldIdx: Integer) {
            return GridField.idToHeading(infos[fieldIdx].id);
        }

        export function getHorizontalAlign(fieldIdx: Integer): RevHorizontalAlignId {
            return RevSourcedField.Field.idToHorizontalAlignId(infos[fieldIdx].id);
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
        id: RevSourcedField.FieldId;
    }

    export function get(cachingFactoryService: TableFieldSourceDefinitionCachingFactory): GridFieldTableFieldSourceDefinition {
        return cachingFactoryService.get(typeId) as GridFieldTableFieldSourceDefinition;
    }

    export function initialiseStatic() {
        Field.initialise();
    }
}
