/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FieldDataType, FieldDataTypeId } from '../../adi/adi-internal-api';
import { CallPut } from '../../services/services-internal-api';
import { AssertInternalError, CommaText, Integer, UnreachableCaseError } from '../../sys/sys-internal-api';
import { TextFormatterService } from '../../text-format/text-format-internal-api';
import { TableFieldCustomHeadingsService } from './table-field-custom-headings-service';
import { TableFieldSourceDefinition } from './table-field-source-definition';
import {
    BooleanTableGridField,
    DateTableGridField,
    DecimalTableGridField,
    EnumTableGridField,
    IvemIdTableGridField,
    LitIvemIdTableGridField,
    NumberTableGridField,
    TableGridField
} from './table-grid-field';
import {
    DateTableGridValue,
    ExerciseTypeIdTableGridValue,
    IsIndexTableGridValue,
    IvemIdTableGridValue,
    LitIvemIdTableGridValue,
    MarketIdTableGridValue,
    NumberTableGridValue,
    PriceTableGridValue,
    TableGridValue
} from './table-grid-value';

export class CallPutTableFieldSourceDefinition extends TableFieldSourceDefinition {

    constructor(textFormatterService: TextFormatterService, customHeadingsService: TableFieldCustomHeadingsService) {
        const fieldInfos = CallPutTableFieldSourceDefinition.createFieldInfos(customHeadingsService);

        super(
            textFormatterService,
            customHeadingsService,
            TableFieldSourceDefinition.TypeId.CallPut,
            CallPutTableFieldSourceDefinition.sourceName,
            fieldInfos
        );
    }

    isFieldSupported(id: CallPut.FieldId) {
        return CallPutTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: CallPut.FieldId) {
        const sourcelessFieldName = CallPutTableFieldSourceDefinition.Field.getNameById(id);
        return CommaText.from2Values(this.sourceName, sourcelessFieldName);
    }

    getSupportedFieldNameById(id: CallPut.FieldId) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('CPTFSDGSFNBI30399', CallPut.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }
}

export namespace CallPutTableFieldSourceDefinition {
    export type SourceName = typeof sourceName;
    export const sourceName = 'Cp';

    export namespace Field {
        const unsupportedIds = [CallPut.FieldId.UnderlyingIvemId, CallPut.FieldId.UnderlyingIsIndex];
        export const count = CallPut.Field.count - unsupportedIds.length;

        interface Info {
            readonly id: CallPut.FieldId;
            readonly fieldConstructor: TableGridField.Constructor;
            readonly valueConstructor: TableGridValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(CallPut.Field.count);

        function idToTableGridConstructors(id: CallPut.FieldId):
            TableFieldSourceDefinition.TableGridConstructors {
            switch (id) {
                case CallPut.FieldId.ExercisePrice:
                    return [DecimalTableGridField, PriceTableGridValue];
                case CallPut.FieldId.ExpiryDate:
                    return [DateTableGridField, DateTableGridValue];
                case CallPut.FieldId.LitId:
                    return [EnumTableGridField, MarketIdTableGridValue];
                case CallPut.FieldId.CallLitIvemId:
                    return [LitIvemIdTableGridField, LitIvemIdTableGridValue];
                case CallPut.FieldId.PutLitIvemId:
                    return [LitIvemIdTableGridField, LitIvemIdTableGridValue];
                case CallPut.FieldId.ContractMultiplier:
                    return [NumberTableGridField, NumberTableGridValue];
                case CallPut.FieldId.ExerciseTypeId:
                    return [EnumTableGridField, ExerciseTypeIdTableGridValue];
                case CallPut.FieldId.UnderlyingIvemId:
                    return [IvemIdTableGridField, IvemIdTableGridValue];
                case CallPut.FieldId.UnderlyingIsIndex:
                    return [BooleanTableGridField, IsIndexTableGridValue];
                default:
                    throw new UnreachableCaseError('CPTFDSFITTGC220291', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return CallPut.Field.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: CallPut.FieldId) {
            return CallPut.Field.idToName(id);
        }

        export function getHeading(fieldIdx: Integer) {
            return CallPut.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return CallPut.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableGridFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableGridValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: CallPut.FieldId) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: CallPut.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseFieldStatic() {
            let fieldIdx = 0;
            for (let id = 0; id < CallPut.Field.count; id++) {
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
        const result = new Array<TableFieldSourceDefinition.FieldInfo>(CallPut.Field.count);

        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < CallPutTableFieldSourceDefinition.Field.count; fieldIdx++) {
            const sourcelessFieldName = CallPutTableFieldSourceDefinition.Field.getName(fieldIdx);
            const name = CommaText.from2Values(sourceName, sourcelessFieldName);
            let heading: string;
            const customHeading = customHeadingsService.tryGetFieldHeading(sourceName, sourcelessFieldName);
            if (customHeading !== undefined) {
                heading = customHeading;
            } else {
                heading = CallPutTableFieldSourceDefinition.Field.getHeading(fieldIdx);
            }

            const dataTypeId = CallPutTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = CallPutTableFieldSourceDefinition.Field.getTableGridFieldConstructor(fieldIdx);
            const valueConstructor = CallPutTableFieldSourceDefinition.Field.getTableGridValueConstructor(fieldIdx);

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
