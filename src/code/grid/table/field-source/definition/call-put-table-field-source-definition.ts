/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CallPut } from '../../../../services/services-internal-api';
import {
    AssertInternalError,
    CommaText,
    FieldDataType,
    FieldDataTypeId,
    Integer,
    UnreachableCaseError
} from "../../../../sys/sys-internal-api";
import {
    BooleanTableField,
    DateTableField,
    DecimalTableField,
    EnumTableField,
    IvemIdTableField,
    LitIvemIdTableField,
    NumberTableField,
    TableField
} from "../../field/grid-table-field-internal-api";
import {
    DateTableValue,
    ExerciseTypeIdTableValue,
    IsIndexTableValue,
    IvemIdTableValue,
    LitIvemIdTableValue,
    MarketIdTableValue,
    NumberTableValue,
    PriceTableValue,
    TableValue
} from '../../value/grid-table-value-internal-api';
import { TableFieldSourceDefinition } from './table-field-source-definition';

export class CallPutTableFieldSourceDefinition extends TableFieldSourceDefinition {
    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(TableFieldSourceDefinition.TypeId.CallPut);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: CallPut.FieldId) {
        return CallPutTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: CallPut.FieldId) {
        const sourcelessFieldName = CallPutTableFieldSourceDefinition.Field.getNameById(id);
        return CommaText.from2Values(this.name, sourcelessFieldName);
    }

    getSupportedFieldNameById(id: CallPut.FieldId) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('CPTFSDGSFNBI30399', CallPut.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }

    private createFieldDefinitions() {
        const result = new Array<TableField.Definition>(CallPut.Field.count);

        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < CallPutTableFieldSourceDefinition.Field.count; fieldIdx++) {
            const sourcelessFieldName = CallPutTableFieldSourceDefinition.Field.getName(fieldIdx);
            const dataTypeId = CallPutTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = CallPutTableFieldSourceDefinition.Field.getTableFieldConstructor(fieldIdx);
            const valueConstructor = CallPutTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);

            result[idx++] = new TableField.Definition(
                this,
                sourcelessFieldName,
                CallPutTableFieldSourceDefinition.Field.getHeading(fieldIdx),
                textAlign,
                fieldConstructor,
                valueConstructor,
            );
        }

        return result;
    }
}

export namespace CallPutTableFieldSourceDefinition {
    export namespace Field {
        const unsupportedIds = [CallPut.FieldId.UnderlyingIvemId, CallPut.FieldId.UnderlyingIsIndex];
        export const count = CallPut.Field.count - unsupportedIds.length;

        interface Info {
            readonly id: CallPut.FieldId;
            readonly fieldConstructor: TableField.Constructor;
            readonly valueConstructor: TableValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(CallPut.Field.count);

        function idToTableGridConstructors(id: CallPut.FieldId):
            TableFieldSourceDefinition.TableGridConstructors {
            switch (id) {
                case CallPut.FieldId.ExercisePrice:
                    return [DecimalTableField, PriceTableValue];
                case CallPut.FieldId.ExpiryDate:
                    return [DateTableField, DateTableValue];
                case CallPut.FieldId.LitId:
                    return [EnumTableField, MarketIdTableValue];
                case CallPut.FieldId.CallLitIvemId:
                    return [LitIvemIdTableField, LitIvemIdTableValue];
                case CallPut.FieldId.PutLitIvemId:
                    return [LitIvemIdTableField, LitIvemIdTableValue];
                case CallPut.FieldId.ContractMultiplier:
                    return [NumberTableField, NumberTableValue];
                case CallPut.FieldId.ExerciseTypeId:
                    return [EnumTableField, ExerciseTypeIdTableValue];
                case CallPut.FieldId.UnderlyingIvemId:
                    return [IvemIdTableField, IvemIdTableValue];
                case CallPut.FieldId.UnderlyingIsIndex:
                    return [BooleanTableField, IsIndexTableValue];
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

        export function getTableFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableValueConstructor(fieldIdx: Integer) {
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
}
