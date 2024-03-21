/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { SearchSymbolsLitIvemFullDetail } from '../../../../adi/internal-api';
import {
    AssertInternalError,
    FieldDataType,
    FieldDataTypeId,
    Integer,
    UnreachableCaseError
} from "../../../../sys/internal-api";
import {
    BooleanCorrectnessTableField,
    CorrectnessTableField,
    DecimalCorrectnessTableField,
    EnumCorrectnessTableField,
    IntegerCorrectnessTableField,
    SourceTzOffsetDateCorrectnessTableField,
    StringArrayCorrectnessTableField,
    StringCorrectnessTableField,
    TableField
} from '../../field/internal-api';
import {
    CallOrPutIdCorrectnessTableValue,
    CorrectnessTableValue,
    DecimalCorrectnessTableValue,
    DepthDirectionIdCorrectnessTableValue,
    ExerciseTypeIdCorrectnessTableValue,
    IntegerCorrectnessTableValue,
    IsIndexCorrectnessTableValue,
    PriceCorrectnessTableValue,
    SourceTzOffsetDateCorrectnessTableValue,
    StringArrayCorrectnessTableValue,
    StringCorrectnessTableValue
} from '../../value/internal-api';
import { TypedTableFieldSourceDefinition } from './typed-table-field-source-definition';
import { TypedTableFieldSourceDefinitionCachingFactoryService } from './typed-table-field-source-definition-caching-factory-service';

export class LitIvemExtendedDetailTableFieldSourceDefinition extends TypedTableFieldSourceDefinition {
    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(LitIvemExtendedDetailTableFieldSourceDefinition.typeId);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: SearchSymbolsLitIvemFullDetail.ExtendedField.Id) {
        return LitIvemExtendedDetailTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: SearchSymbolsLitIvemFullDetail.ExtendedField.Id) {
        const sourcelessFieldName = LitIvemExtendedDetailTableFieldSourceDefinition.Field.getNameById(id);
        return this.encodeFieldName(sourcelessFieldName);
    }

    getSupportedFieldNameById(id: SearchSymbolsLitIvemFullDetail.ExtendedField.Id) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('LIEDTFSDGSFNBI30999', SearchSymbolsLitIvemFullDetail.ExtendedField.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }

    private createFieldDefinitions() {
        const result = new Array<TableField.Definition>(LitIvemExtendedDetailTableFieldSourceDefinition.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < LitIvemExtendedDetailTableFieldSourceDefinition.Field.count; fieldIdx++) {
            const sourcelessFieldName = LitIvemExtendedDetailTableFieldSourceDefinition.Field.getName(fieldIdx);
            const dataTypeId = LitIvemExtendedDetailTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = LitIvemExtendedDetailTableFieldSourceDefinition.Field.getTableFieldConstructor(fieldIdx);
            const valueConstructor = LitIvemExtendedDetailTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);

            result[idx++] = new TableField.Definition(
                this,
                sourcelessFieldName,
                LitIvemExtendedDetailTableFieldSourceDefinition.Field.getHeading(fieldIdx),
                textAlign,
                fieldConstructor,
                valueConstructor,
            );
        }

        return result;
    }
}

export namespace LitIvemExtendedDetailTableFieldSourceDefinition {
    export const typeId = TypedTableFieldSourceDefinition.TypeId.LitIvemExtendedDetail;
    export type TypeId = typeof typeId;

    export namespace Field {
        const unsupportedIds: SearchSymbolsLitIvemFullDetail.ExtendedField.Id[] = [
            SearchSymbolsLitIvemFullDetail.ExtendedField.Id.Attributes,
            SearchSymbolsLitIvemFullDetail.ExtendedField.Id.TmcLegs
        ];
        export const count = SearchSymbolsLitIvemFullDetail.ExtendedField.idCount - unsupportedIds.length;

        class Info {
            id: SearchSymbolsLitIvemFullDetail.ExtendedField.Id;
            fieldConstructor: CorrectnessTableField.Constructor;
            valueConstructor: CorrectnessTableValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(SearchSymbolsLitIvemFullDetail.ExtendedField.idCount);

        function idToTableGridConstructors(id: SearchSymbolsLitIvemFullDetail.ExtendedField.Id):
            TypedTableFieldSourceDefinition.CorrectnessTableGridConstructors {
            switch (id) {
                case SearchSymbolsLitIvemFullDetail.ExtendedField.Id.Cfi:
                    return [StringCorrectnessTableField, StringCorrectnessTableValue];
                case SearchSymbolsLitIvemFullDetail.ExtendedField.Id.DepthDirectionId:
                    return [EnumCorrectnessTableField, DepthDirectionIdCorrectnessTableValue];
                case SearchSymbolsLitIvemFullDetail.ExtendedField.Id.IsIndex:
                    return [BooleanCorrectnessTableField, IsIndexCorrectnessTableValue];
                case SearchSymbolsLitIvemFullDetail.ExtendedField.Id.ExpiryDate:
                    return [SourceTzOffsetDateCorrectnessTableField, SourceTzOffsetDateCorrectnessTableValue];
                case SearchSymbolsLitIvemFullDetail.ExtendedField.Id.StrikePrice:
                    return [DecimalCorrectnessTableField, PriceCorrectnessTableValue];
                case SearchSymbolsLitIvemFullDetail.ExtendedField.Id.ExerciseTypeId:
                    return [EnumCorrectnessTableField, ExerciseTypeIdCorrectnessTableValue];
                case SearchSymbolsLitIvemFullDetail.ExtendedField.Id.CallOrPutId:
                    return [EnumCorrectnessTableField, CallOrPutIdCorrectnessTableValue];
                case SearchSymbolsLitIvemFullDetail.ExtendedField.Id.ContractSize:
                    return [DecimalCorrectnessTableField, DecimalCorrectnessTableValue];
                case SearchSymbolsLitIvemFullDetail.ExtendedField.Id.LotSize:
                    return [IntegerCorrectnessTableField, IntegerCorrectnessTableValue];
                case SearchSymbolsLitIvemFullDetail.ExtendedField.Id.Categories:
                    return [StringArrayCorrectnessTableField, StringArrayCorrectnessTableValue];
                case SearchSymbolsLitIvemFullDetail.ExtendedField.Id.Attributes:
                case SearchSymbolsLitIvemFullDetail.ExtendedField.Id.TmcLegs:
                    throw new AssertInternalError('LIEDTFDSFITTGCA1200069', SearchSymbolsLitIvemFullDetail.ExtendedField.idToName(id));
                default:
                    throw new UnreachableCaseError('LIEDTFDSFITTGCU1200069', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return SearchSymbolsLitIvemFullDetail.ExtendedField.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: SearchSymbolsLitIvemFullDetail.ExtendedField.Id) {
            return SearchSymbolsLitIvemFullDetail.ExtendedField.idToName(id);
        }

        export function getHeading(fieldIdx: Integer) {
            return SearchSymbolsLitIvemFullDetail.ExtendedField.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return SearchSymbolsLitIvemFullDetail.ExtendedField.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: SearchSymbolsLitIvemFullDetail.ExtendedField.Id) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: SearchSymbolsLitIvemFullDetail.ExtendedField.Id) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseFieldStatic() {
            let fieldIdx = 0;
            for (let id = 0; id < SearchSymbolsLitIvemFullDetail.ExtendedField.idCount; id++) {
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
        sourceTypeId: LitIvemExtendedDetailTableFieldSourceDefinition.TypeId;
        id: SearchSymbolsLitIvemFullDetail.ExtendedField.Id;
    }

    export function get(cachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService): LitIvemExtendedDetailTableFieldSourceDefinition {
        return cachingFactoryService.get(typeId) as LitIvemExtendedDetailTableFieldSourceDefinition;
    }

    export function initialiseStatic() {
        Field.initialiseFieldStatic();
    }
}
