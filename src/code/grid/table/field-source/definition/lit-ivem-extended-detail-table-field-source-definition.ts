/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { SearchSymbolsLitIvemFullDetail } from '../../../../adi/adi-internal-api';
import {
    AssertInternalError,
    CommaText,
    FieldDataType,
    FieldDataTypeId,
    Integer,
    UnreachableCaseError
} from "../../../../sys/sys-internal-api";
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
} from '../../field/grid-table-field-internal-api';
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
} from '../../value/grid-table-value-internal-api';
import { TableFieldSourceDefinition } from './table-field-source-definition';

export class LitIvemExtendedDetailTableFieldSourceDefinition extends TableFieldSourceDefinition {
    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(TableFieldSourceDefinition.TypeId.LitIvemExtendedDetail);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: SearchSymbolsLitIvemFullDetail.ExtendedField.Id) {
        return LitIvemExtendedDetailTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: SearchSymbolsLitIvemFullDetail.ExtendedField.Id) {
        const sourcelessFieldName = LitIvemExtendedDetailTableFieldSourceDefinition.Field.getNameById(id);
        return CommaText.from2Values(this.name, sourcelessFieldName);
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
            TableFieldSourceDefinition.CorrectnessTableGridConstructors {
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

    export function initialiseStatic() {
        Field.initialiseFieldStatic();
    }
}
