/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RankedLitIvemIdListDirectoryItem } from '../../../../services/internal-api';
import { AssertInternalError, FieldDataType, FieldDataTypeId, Integer } from '../../../../sys/internal-api';
import {
    BooleanCorrectnessTableField,
    CorrectnessTableField,
    EnumCorrectnessTableField,
    StringCorrectnessTableField,
    TableField
} from "../../field/internal-api";
import {
    CorrectnessTableValue,
    RankedLitIvemIdListDirectoryItemTypeIdCorrectnessTableValue,
    StringCorrectnessTableValue,
    WritableCorrectnessTableValue
} from '../../value/internal-api';
import { TypedTableFieldSourceDefinition } from './typed-table-field-source-definition';
import { TypedTableFieldSourceDefinitionCachingFactoryService } from './typed-table-field-source-definition-caching-factory-service';

/** @public */
export class RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition extends TypedTableFieldSourceDefinition {
    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition.typeId);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: RankedLitIvemIdListDirectoryItem.FieldId) {
        return RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: RankedLitIvemIdListDirectoryItem.FieldId) {
        const sourcelessFieldName = RankedLitIvemIdListDirectoryItem.Field.idToName(id);
        return this.encodeFieldName(sourcelessFieldName);
    }

    getSupportedFieldNameById(id: RankedLitIvemIdListDirectoryItem.FieldId) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('STFSDGSFNBI30398', RankedLitIvemIdListDirectoryItem.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }

    private createFieldDefinitions() {
        const count = RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition.Field.count;
        const result = new Array<TableField.Definition>(count);

        for (let fieldIdx = 0; fieldIdx < count; fieldIdx++) {
            const sourcelessFieldName = RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition.Field.getName(fieldIdx);
            const heading = RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition.Field.getHeading(fieldIdx);
            const dataTypeId = RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const [fieldConstructor, valueConstructor] =
            RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition.Field.getTableFieldValueConstructors(fieldIdx);

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
export namespace RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition {
    export const typeId = TypedTableFieldSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem;
    export type TypeId = typeof typeId;

    export namespace Field {
        const unsupportedIds: RankedLitIvemIdListDirectoryItem.FieldId[] = [];
        export const count = RankedLitIvemIdListDirectoryItem.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: RankedLitIvemIdListDirectoryItem.FieldId;
            readonly tableFieldValueConstructors: [field: CorrectnessTableField.Constructor, value: CorrectnessTableValue.Constructor];
        }

        const infos: Info[] = [
            {
                id: RankedLitIvemIdListDirectoryItem.FieldId.TypeId,
                tableFieldValueConstructors: [EnumCorrectnessTableField, RankedLitIvemIdListDirectoryItemTypeIdCorrectnessTableValue],
            },
            {
                id: RankedLitIvemIdListDirectoryItem.FieldId.Id,
                tableFieldValueConstructors: [StringCorrectnessTableField, StringCorrectnessTableValue],
            },
            {
                id: RankedLitIvemIdListDirectoryItem.FieldId.Readonly,
                tableFieldValueConstructors: [BooleanCorrectnessTableField, WritableCorrectnessTableValue],
            },
            {
                id: RankedLitIvemIdListDirectoryItem.FieldId.Name,
                tableFieldValueConstructors: [StringCorrectnessTableField, StringCorrectnessTableValue],
            },
            {
                id: RankedLitIvemIdListDirectoryItem.FieldId.Description,
                tableFieldValueConstructors: [StringCorrectnessTableField, StringCorrectnessTableValue],
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

        export function isIdSupported(id: RankedLitIvemIdListDirectoryItem.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function indexOfId(id: RankedLitIvemIdListDirectoryItem.FieldId) {
            return idFieldIndices[id];
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return RankedLitIvemIdListDirectoryItem.Field.idToName(infos[fieldIdx].id);
        }

        export function getHeading(fieldIdx: Integer) {
            return RankedLitIvemIdListDirectoryItem.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return RankedLitIvemIdListDirectoryItem.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableFieldValueConstructors(fieldIndex: Integer) {
            return infos[fieldIndex].tableFieldValueConstructors;
        }

        export function getTableValueConstructor(fieldIndex: Integer) {
            const constructors = getTableFieldValueConstructors(fieldIndex);
            return constructors[1];
        }
    }

    export interface FieldId extends TypedTableFieldSourceDefinition.FieldId {
        sourceTypeId: RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition.TypeId;
        id: RankedLitIvemIdListDirectoryItem.FieldId;
    }

    export function get(cachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService): RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition {
        return cachingFactoryService.get(typeId) as RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition;
    }

    export function initialiseStatic() {
        Field.initialise();
    }
}
