/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FieldDataType, FieldDataTypeId, LitIvemFullDetail } from '../../../../adi/adi-internal-api';
import { AssertInternalError, CommaText, Integer, UnreachableCaseError } from '../../../../sys/sys-internal-api';
import { TextFormatterService } from '../../../../text-format/text-format-internal-api';
import {
    BooleanDataItemTableField,
    CorrectnessTableField,
    DecimalDataItemTableField,
    EnumDataItemTableField,
    IntegerDataItemTableField,
    SourceTzOffsetDateDataItemTableField,
    StringArrayDataItemTableField,
    StringDataItemTableField
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
import { TableFieldCustomHeadingsService } from './table-field-custom-headings-service';
import { TableFieldSourceDefinition } from './table-field-source-definition';

export class LitIvemExtendedDetailTableFieldSourceDefinition extends TableFieldSourceDefinition {

    constructor(textFormatterService: TextFormatterService, customHeadingsService: TableFieldCustomHeadingsService) {
        const fieldInfos = LitIvemExtendedDetailTableFieldSourceDefinition.createFieldInfos(customHeadingsService);

        super(
            textFormatterService,
            customHeadingsService,
            TableFieldSourceDefinition.TypeId.LitIvemExtendedDetail,
            LitIvemExtendedDetailTableFieldSourceDefinition.sourceName,
            fieldInfos
        );
    }

    isFieldSupported(id: LitIvemFullDetail.ExtendedField.Id) {
        return LitIvemExtendedDetailTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: LitIvemFullDetail.ExtendedField.Id) {
        const sourcelessFieldName = LitIvemExtendedDetailTableFieldSourceDefinition.Field.getNameById(id);
        return CommaText.from2Values(this.sourceName, sourcelessFieldName);
    }

    getSupportedFieldNameById(id: LitIvemFullDetail.ExtendedField.Id) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('LIEDTFSDGSFNBI30999', LitIvemFullDetail.ExtendedField.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }
}

export namespace LitIvemExtendedDetailTableFieldSourceDefinition {
    export type SourceName = typeof sourceName;
    export const sourceName = 'Lie';

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
                    return [StringDataItemTableField, StringCorrectnessTableValue];
                case LitIvemFullDetail.ExtendedField.Id.DepthDirectionId:
                    return [EnumDataItemTableField, DepthDirectionIdCorrectnessTableValue];
                case LitIvemFullDetail.ExtendedField.Id.IsIndex:
                    return [BooleanDataItemTableField, IsIndexCorrectnessTableValue];
                case LitIvemFullDetail.ExtendedField.Id.ExpiryDate:
                    return [SourceTzOffsetDateDataItemTableField, SourceTzOffsetDateCorrectnessTableValue];
                case LitIvemFullDetail.ExtendedField.Id.StrikePrice:
                    return [DecimalDataItemTableField, PriceCorrectnessTableValue];
                case LitIvemFullDetail.ExtendedField.Id.ExerciseTypeId:
                    return [EnumDataItemTableField, ExerciseTypeIdCorrectnessTableValue];
                case LitIvemFullDetail.ExtendedField.Id.CallOrPutId:
                    return [EnumDataItemTableField, CallOrPutIdCorrectnessTableValue];
                case LitIvemFullDetail.ExtendedField.Id.ContractSize:
                    return [DecimalDataItemTableField, DecimalCorrectnessTableValue];
                case LitIvemFullDetail.ExtendedField.Id.LotSize:
                    return [IntegerDataItemTableField, IntegerCorrectnessTableValue];
                case LitIvemFullDetail.ExtendedField.Id.Categories:
                    return [StringArrayDataItemTableField, StringArrayCorrectnessTableValue];
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

    export function createFieldInfos(customHeadingsService: TableFieldCustomHeadingsService) {
        const result = new Array<TableFieldSourceDefinition.FieldInfo>(LitIvemExtendedDetailTableFieldSourceDefinition.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < LitIvemExtendedDetailTableFieldSourceDefinition.Field.count; fieldIdx++) {
            const sourcelessFieldName = LitIvemExtendedDetailTableFieldSourceDefinition.Field.getName(fieldIdx);
            const name = CommaText.from2Values(sourceName, sourcelessFieldName);
            let heading: string;
            const customHeading = customHeadingsService.tryGetFieldHeading(sourceName, sourcelessFieldName);
            if (customHeading !== undefined) {
                heading = customHeading;
            } else {
                heading = LitIvemExtendedDetailTableFieldSourceDefinition.Field.getHeading(fieldIdx);
            }

            const dataTypeId = LitIvemExtendedDetailTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = LitIvemExtendedDetailTableFieldSourceDefinition.Field.getTableFieldConstructor(fieldIdx);
            const valueConstructor = LitIvemExtendedDetailTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);

            result[idx++] = {
                sourcelessName: sourcelessFieldName,
                name,
                heading,
                textAlign,
                gridFieldConstructor: fieldConstructor,
                gridValueConstructor: valueConstructor,
            };
        }

        return result;
    }
}
