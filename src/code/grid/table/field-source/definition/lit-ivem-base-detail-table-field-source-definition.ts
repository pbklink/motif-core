/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemDetail } from '../../../../adi/adi-internal-api';
import {
    AssertInternalError,
    CommaText,
    FieldDataType,
    FieldDataTypeId,
    Integer,
    UnreachableCaseError
} from "../../../../sys/sys-internal-api";
import {
    CorrectnessTableField,
    EnumCorrectnessTableField,
    IntegerArrayCorrectnessTableField,
    LitIvemIdCorrectnessTableField,
    StringCorrectnessTableField,
    TableField
} from '../../field/grid-table-field-internal-api';
import {
    CorrectnessTableValue,
    ExchangeIdCorrectnessTableValue,
    IvemClassIdCorrectnessTableValue,
    LitIvemIdCorrectnessTableValue,
    MarketIdArrayCorrectnessTableValue,
    MarketIdCorrectnessTableValue,
    StringCorrectnessTableValue,
    ZenithSubscriptionDataIdArrayCorrectnessTableValue
} from '../../value/grid-table-value-internal-api';
import { TableFieldSourceDefinition } from './table-field-source-definition';

export class LitIvemBaseDetailTableFieldSourceDefinition extends TableFieldSourceDefinition {
    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(
            TableFieldSourceDefinition.TypeId.LitIvemBaseDetail,
            LitIvemBaseDetailTableFieldSourceDefinition.name,
        );

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: LitIvemDetail.BaseField.Id) {
        return LitIvemBaseDetailTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: LitIvemDetail.BaseField.Id) {
        const sourcelessFieldName = LitIvemBaseDetailTableFieldSourceDefinition.Field.getNameById(id);
        return CommaText.from2Values(this.name, sourcelessFieldName);
    }

    getSupportedFieldNameById(id: LitIvemDetail.BaseField.Id) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('LIBDTFSDGSFNBI30499', LitIvemDetail.BaseField.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }

    private createFieldDefinitions() {
        const result = new Array<TableField.Definition>(LitIvemBaseDetailTableFieldSourceDefinition.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < LitIvemBaseDetailTableFieldSourceDefinition.Field.count; fieldIdx++) {
            const sourcelessFieldName = LitIvemBaseDetailTableFieldSourceDefinition.Field.getName(fieldIdx);
            const fieldName = CommaText.from2Values(LitIvemBaseDetailTableFieldSourceDefinition.name, sourcelessFieldName);

            const dataTypeId = LitIvemBaseDetailTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = LitIvemBaseDetailTableFieldSourceDefinition.Field.getTableFieldConstructor(fieldIdx);
            const valueConstructor = LitIvemBaseDetailTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);

            result[idx++] = new TableField.Definition(
                fieldName,
                this,
                LitIvemBaseDetailTableFieldSourceDefinition.Field.getHeading(fieldIdx),
                textAlign,
                sourcelessFieldName,
                fieldConstructor,
                valueConstructor,
            );
        }

        return result;
    }
}

export namespace LitIvemBaseDetailTableFieldSourceDefinition {
    export type SourceName = typeof name;
    export const name = TableFieldSourceDefinition.Type.litIvemBaseDetailName;

    export namespace Field {
        const unsupportedIds: LitIvemDetail.BaseField.Id[] = [];
        export const count = LitIvemDetail.BaseField.idCount - unsupportedIds.length;

        interface Info {
            readonly id: LitIvemDetail.BaseField.Id;
            readonly fieldConstructor: CorrectnessTableField.Constructor;
            readonly valueConstructor: CorrectnessTableValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(LitIvemDetail.BaseField.idCount);

        function idToTableGridConstructors(id: LitIvemDetail.BaseField.Id):
            TableFieldSourceDefinition.CorrectnessTableGridConstructors {
            switch (id) {
                case LitIvemDetail.BaseField.Id.Id:
                    return [LitIvemIdCorrectnessTableField, LitIvemIdCorrectnessTableValue];
                case LitIvemDetail.BaseField.Id.Code:
                    return [StringCorrectnessTableField, StringCorrectnessTableValue];
                case LitIvemDetail.BaseField.Id.MarketId:
                    return [EnumCorrectnessTableField, MarketIdCorrectnessTableValue];
                case LitIvemDetail.BaseField.Id.IvemClassId:
                    return [EnumCorrectnessTableField, IvemClassIdCorrectnessTableValue];
                case LitIvemDetail.BaseField.Id.SubscriptionDataIds:
                    return [IntegerArrayCorrectnessTableField, ZenithSubscriptionDataIdArrayCorrectnessTableValue];
                case LitIvemDetail.BaseField.Id.TradingMarketIds:
                    return [IntegerArrayCorrectnessTableField, MarketIdArrayCorrectnessTableValue];
                case LitIvemDetail.BaseField.Id.Name:
                    return [StringCorrectnessTableField, StringCorrectnessTableValue];
                case LitIvemDetail.BaseField.Id.ExchangeId:
                    return [EnumCorrectnessTableField, ExchangeIdCorrectnessTableValue];
                case LitIvemDetail.BaseField.Id.AlternateCodes:
                    return [StringCorrectnessTableField, StringCorrectnessTableValue];
                default:
                    throw new UnreachableCaseError('LIBDTFDSFITTGC2039994', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return LitIvemDetail.BaseField.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: LitIvemDetail.BaseField.Id) {
            return LitIvemDetail.BaseField.idToName(id);
        }

        export function getHeading(fieldIdx: Integer) {
            return LitIvemDetail.BaseField.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return LitIvemDetail.BaseField.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: LitIvemDetail.BaseField.Id) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: LitIvemDetail.BaseField.Id) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseFieldStatic() {
            let fieldIdx = 0;
            for (let id = 0; id < LitIvemDetail.BaseField.idCount; id++) {
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
