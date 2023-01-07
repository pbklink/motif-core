/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FieldDataType, FieldDataTypeId, LitIvemFullDetail } from '../../../../adi/adi-internal-api';
import { AssertInternalError, CommaText, Integer, UnreachableCaseError } from '../../../../sys/sys-internal-api';
import {
    BooleanCorrectnessTableField,
    CorrectnessTableField,
    DecimalCorrectnessTableField,
    EnumCorrectnessTableField,
    IntegerCorrectnessTableField,
    SourceTzOffsetDateCorrectnessTableField,
    StringArrayCorrectnessTableField,
    StringCorrectnessTableField,
    TableFieldDefinition
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
    override readonly fieldDefinitions: TableFieldDefinition[];

    constructor() {
        super(
            TableFieldSourceDefinition.TypeId.LitIvemExtendedDetail,
            LitIvemExtendedDetailTableFieldSourceDefinition.name,
        );

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: LitIvemFullDetail.ExtendedField.Id) {
        return LitIvemExtendedDetailTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: LitIvemFullDetail.ExtendedField.Id) {
        const sourcelessFieldName = LitIvemExtendedDetailTableFieldSourceDefinition.Field.getNameById(id);
        return CommaText.from2Values(this.name, sourcelessFieldName);
    }

    getSupportedFieldNameById(id: LitIvemFullDetail.ExtendedField.Id) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('LIEDTFSDGSFNBI30999', LitIvemFullDetail.ExtendedField.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }

    private createFieldDefinitions() {
        const result = new Array<TableFieldDefinition>(LitIvemExtendedDetailTableFieldSourceDefinition.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < LitIvemExtendedDetailTableFieldSourceDefinition.Field.count; fieldIdx++) {
            const sourcelessFieldName = LitIvemExtendedDetailTableFieldSourceDefinition.Field.getName(fieldIdx);
            const fieldName = CommaText.from2Values(LitIvemExtendedDetailTableFieldSourceDefinition.name, sourcelessFieldName);

            const dataTypeId = LitIvemExtendedDetailTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = LitIvemExtendedDetailTableFieldSourceDefinition.Field.getTableFieldConstructor(fieldIdx);
            const valueConstructor = LitIvemExtendedDetailTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);

            result[idx++] = new TableFieldDefinition(
                fieldName,
                this,
                LitIvemExtendedDetailTableFieldSourceDefinition.Field.getHeading(fieldIdx),
                textAlign,
                sourcelessFieldName,
                fieldConstructor,
                valueConstructor,
            );
        }

        return result;
    }
}

export namespace LitIvemExtendedDetailTableFieldSourceDefinition {
    export type SourceName = typeof name;
    export const name = 'Lie';

    export namespace Field {
        const unsupportedIds: LitIvemFullDetail.ExtendedField.Id[] = [
            LitIvemFullDetail.ExtendedField.Id.Attributes,
            LitIvemFullDetail.ExtendedField.Id.TmcLegs
        ];
        export const count = LitIvemFullDetail.ExtendedField.idCount - unsupportedIds.length;

        class Info {
            id: LitIvemFullDetail.ExtendedField.Id;
            fieldConstructor: CorrectnessTableField.Constructor;
            valueConstructor: CorrectnessTableValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(LitIvemFullDetail.ExtendedField.idCount);

        function idToTableGridConstructors(id: LitIvemFullDetail.ExtendedField.Id):
            TableFieldSourceDefinition.CorrectnessTableGridConstructors {
            switch (id) {
                case LitIvemFullDetail.ExtendedField.Id.Cfi:
                    return [StringCorrectnessTableField, StringCorrectnessTableValue];
                case LitIvemFullDetail.ExtendedField.Id.DepthDirectionId:
                    return [EnumCorrectnessTableField, DepthDirectionIdCorrectnessTableValue];
                case LitIvemFullDetail.ExtendedField.Id.IsIndex:
                    return [BooleanCorrectnessTableField, IsIndexCorrectnessTableValue];
                case LitIvemFullDetail.ExtendedField.Id.ExpiryDate:
                    return [SourceTzOffsetDateCorrectnessTableField, SourceTzOffsetDateCorrectnessTableValue];
                case LitIvemFullDetail.ExtendedField.Id.StrikePrice:
                    return [DecimalCorrectnessTableField, PriceCorrectnessTableValue];
                case LitIvemFullDetail.ExtendedField.Id.ExerciseTypeId:
                    return [EnumCorrectnessTableField, ExerciseTypeIdCorrectnessTableValue];
                case LitIvemFullDetail.ExtendedField.Id.CallOrPutId:
                    return [EnumCorrectnessTableField, CallOrPutIdCorrectnessTableValue];
                case LitIvemFullDetail.ExtendedField.Id.ContractSize:
                    return [DecimalCorrectnessTableField, DecimalCorrectnessTableValue];
                case LitIvemFullDetail.ExtendedField.Id.LotSize:
                    return [IntegerCorrectnessTableField, IntegerCorrectnessTableValue];
                case LitIvemFullDetail.ExtendedField.Id.Categories:
                    return [StringArrayCorrectnessTableField, StringArrayCorrectnessTableValue];
                case LitIvemFullDetail.ExtendedField.Id.Attributes:
                case LitIvemFullDetail.ExtendedField.Id.TmcLegs:
                    throw new AssertInternalError('LIEDTFDSFITTGCA1200069', LitIvemFullDetail.ExtendedField.idToName(id));
                default:
                    throw new UnreachableCaseError('LIEDTFDSFITTGCU1200069', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return LitIvemFullDetail.ExtendedField.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: LitIvemFullDetail.ExtendedField.Id) {
            return LitIvemFullDetail.ExtendedField.idToName(id);
        }

        export function getHeading(fieldIdx: Integer) {
            return LitIvemFullDetail.ExtendedField.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return LitIvemFullDetail.ExtendedField.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: LitIvemFullDetail.ExtendedField.Id) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: LitIvemFullDetail.ExtendedField.Id) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseFieldStatic() {
            let fieldIdx = 0;
            for (let id = 0; id < LitIvemFullDetail.ExtendedField.idCount; id++) {
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
