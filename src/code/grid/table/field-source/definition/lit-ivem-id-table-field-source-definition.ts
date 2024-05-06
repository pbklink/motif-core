/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevHorizontalAlignId } from '@xilytix/revgrid';
import { LitIvemId } from '../../../../adi/internal-api';
import {
    AssertInternalError,
    FieldDataType,
    FieldDataTypeId,
    Integer
} from "../../../../sys/internal-api";
import {
    EnumTableField,
    LitIvemIdTableField,
    StringTableField,
    TableField
} from "../../field/internal-api";
import {
    DataEnvironmentIdTableValue,
    LitIvemIdTableValue,
    MarketIdTableValue,
    StringTableValue,
    TableValue
} from "../../value/internal-api";
import { TableFieldSourceDefinition } from './table-field-source-definition';
import { TableFieldSourceDefinitionCachingFactory } from './table-field-source-definition-caching-factory';

/** @public */
export class LitIvemIdTableFieldSourceDefinition extends TableFieldSourceDefinition {
    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(LitIvemIdTableFieldSourceDefinition.typeId);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: LitIvemId.FieldId) {
        return LitIvemIdTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: LitIvemId.FieldId) {
        const sourcelessFieldName = LitIvemId.Field.idToName(id);
        return this.encodeFieldName(sourcelessFieldName);
    }

    getSupportedFieldNameById(id: LitIvemId.FieldId) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('LIITFSDGSFNBI59321', LitIvemId.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }

    private createFieldDefinitions() {
        const count = LitIvemIdTableFieldSourceDefinition.Field.count;
        const result = new Array<TableField.Definition>(count);

        for (let fieldIdx = 0; fieldIdx < count; fieldIdx++) {
            const sourcelessFieldName = LitIvemIdTableFieldSourceDefinition.Field.getName(fieldIdx);
            const heading = LitIvemIdTableFieldSourceDefinition.Field.getHeading(fieldIdx);
            const dataTypeId = LitIvemIdTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlignId = FieldDataType.idIsNumber(dataTypeId) ? RevHorizontalAlignId.Right : RevHorizontalAlignId.Left;
            const [fieldConstructor, valueConstructor] =
            LitIvemIdTableFieldSourceDefinition.Field.getTableFieldValueConstructors(fieldIdx);

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
export namespace LitIvemIdTableFieldSourceDefinition {
    export const typeId = TableFieldSourceDefinition.TypeId.LitIvemId;
    export type TypeId = typeof typeId;

    export namespace Field {
        const unsupportedIds: LitIvemId.FieldId[] = [];
        export const count = LitIvemId.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: LitIvemId.FieldId;
            readonly tableFieldValueConstructors: [field: TableField.Constructor, value: TableValue.Constructor];
        }

        const infos: Info[] = [
            {
                id: LitIvemId.FieldId.LitIvemId,
                tableFieldValueConstructors: [LitIvemIdTableField, LitIvemIdTableValue],
            },
            {
                id: LitIvemId.FieldId.Code,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: LitIvemId.FieldId.LitId,
                tableFieldValueConstructors: [EnumTableField, MarketIdTableValue],
            },
            {
                id: LitIvemId.FieldId.EnvironmentId,
                tableFieldValueConstructors: [EnumTableField, DataEnvironmentIdTableValue],
            },
        ];

        const idFieldIndices = new Array<Integer>(LitIvemId.Field.idCount);

        export function initialise() {
            for (let id = 0; id < LitIvemId.Field.idCount; id++) {
                idFieldIndices[id] = -1;
            }

            for (let fieldIndex = 0; fieldIndex < count; fieldIndex++) {
                const id = infos[fieldIndex].id;
                if (unsupportedIds.includes(id)) {
                    throw new AssertInternalError('LIITFSDFII42422', fieldIndex.toString());
                } else {
                    if (idFieldIndices[id] !== -1) {
                        throw new AssertInternalError('LIITFSDFID42422', fieldIndex.toString()); // duplicate
                    } else {
                        idFieldIndices[id] = fieldIndex;
                    }
                }
            }
        }

        export function isIdSupported(id: LitIvemId.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function indexOfId(id: LitIvemId.FieldId) {
            return idFieldIndices[id];
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return LitIvemId.Field.idToName(infos[fieldIdx].id);
        }

        export function getHeading(fieldIdx: Integer) {
            return LitIvemId.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return LitIvemId.Field.idToFieldDataTypeId(infos[fieldIdx].id);
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
        sourceTypeId: LitIvemIdTableFieldSourceDefinition.TypeId;
        id: LitIvemId.FieldId;
    }

    export function get(cachingFactoryService: TableFieldSourceDefinitionCachingFactory): LitIvemIdTableFieldSourceDefinition {
        return cachingFactoryService.get(typeId) as LitIvemIdTableFieldSourceDefinition;
    }

    export function initialiseStatic() {
        Field.initialise();
    }
}
