/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Feed } from '../../../../adi/internal-api';
import {
    AssertInternalError,
    FieldDataType,
    FieldDataTypeId,
    Integer,
    UnreachableCaseError
} from "../../../../sys/internal-api";
import {
    CorrectnessTableField,
    EnumCorrectnessTableField,
    IntegerCorrectnessTableField,
    StringCorrectnessTableField,
    TableField
} from '../../field/internal-api';
import {
    CorrectnessTableValue,
    FeedClassIdCorrectnessTableValue,
    FeedStatusIdCorrectnessTableValue,
    IntegerCorrectnessTableValue,
    StringCorrectnessTableValue
} from '../../value/internal-api';
import { TypedTableFieldSourceDefinition } from './typed-table-field-source-definition';
import { TypedTableFieldSourceDefinitionCachingFactoryService } from './typed-table-field-source-definition-caching-factory-service';

export class FeedTableFieldSourceDefinition extends TypedTableFieldSourceDefinition {
    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(FeedTableFieldSourceDefinition.typeId);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: Feed.FieldId) {
        return FeedTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: Feed.FieldId) {
        const sourcelessFieldName = FeedTableFieldSourceDefinition.Field.getNameById(id);
        return this.encodeFieldName(sourcelessFieldName);
    }

    getSupportedFieldNameById(id: Feed.FieldId) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('FTFSDGSFNBI30899', Feed.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }

    private createFieldDefinitions() {
        const result = new Array<TableField.Definition>(FeedTableFieldSourceDefinition.Field.count);

        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < FeedTableFieldSourceDefinition.Field.count; fieldIdx++) {
            const sourcelessFieldName = FeedTableFieldSourceDefinition.Field.getName(fieldIdx);
            const dataTypeId = FeedTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = FeedTableFieldSourceDefinition.Field.getTableFieldConstructor(fieldIdx);
            const valueConstructor = FeedTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);

            result[idx++] = new TableField.Definition(
                this,
                sourcelessFieldName,
                FeedTableFieldSourceDefinition.Field.getHeading(fieldIdx),
                textAlign,
                fieldConstructor,
                valueConstructor,
            );
        }

        return result;
    }
}

export namespace FeedTableFieldSourceDefinition {
    export const typeId = TypedTableFieldSourceDefinition.TypeId.Feed;
    export type TypeId = typeof typeId;

    export namespace Field {
        const unsupportedIds = [Feed.FieldId.Id, Feed.FieldId.EnvironmentDisplay];
        export const count = Feed.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: Feed.FieldId;
            readonly fieldConstructor: CorrectnessTableField.Constructor;
            readonly valueConstructor: CorrectnessTableValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(Feed.Field.idCount);

        function idToTableGridConstructors(id: Feed.FieldId):
            TypedTableFieldSourceDefinition.CorrectnessTableGridConstructors {
            switch (id) {
                case Feed.FieldId.Id:
                    return [IntegerCorrectnessTableField, IntegerCorrectnessTableValue];
                case Feed.FieldId.Name:
                    return [StringCorrectnessTableField, StringCorrectnessTableValue];
                case Feed.FieldId.StatusId:
                    return [EnumCorrectnessTableField, FeedStatusIdCorrectnessTableValue];
                case Feed.FieldId.ClassId:
                    return [EnumCorrectnessTableField, FeedClassIdCorrectnessTableValue];
                case Feed.FieldId.EnvironmentDisplay:
                    return [StringCorrectnessTableField, StringCorrectnessTableValue];
                default:
                    throw new UnreachableCaseError('BATFDSFITTGC1200049', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return Feed.Field.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: Feed.FieldId) {
            return Feed.Field.idToName(id);
        }

        export function getHeading(fieldIdx: Integer) {
            return Feed.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return Feed.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: Feed.FieldId) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: Feed.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseFieldStatic() {
            let fieldIdx = 0;
            for (let id = 0; id < Feed.Field.idCount; id++) {
                if (unsupportedIds.includes(id)) {
                    idFieldIndices[id] = -1;
                } else {
                    idFieldIndices[id] = fieldIdx;

                    const [fieldConstructor, valueConstructor] = idToTableGridConstructors(id);
                    infos[fieldIdx++] = {
                        id,
                        fieldConstructor,
                        valueConstructor,
                    };
                }
            }
        }
    }

    export interface FieldId extends TypedTableFieldSourceDefinition.FieldId {
        sourceTypeId: FeedTableFieldSourceDefinition.TypeId;
        id: Feed.FieldId;
    }

    export function get(cachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService): FeedTableFieldSourceDefinition {
        return cachingFactoryService.get(typeId) as FeedTableFieldSourceDefinition;
    }

    export function initialiseStatic() {
        Field.initialiseFieldStatic();
    }
}
