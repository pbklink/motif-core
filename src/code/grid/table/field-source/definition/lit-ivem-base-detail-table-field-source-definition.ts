/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemBaseDetail } from '../../../../adi/internal-api';
import {
    AssertInternalError,
    FieldDataType,
    FieldDataTypeId,
    Integer,
    UnreachableCaseError
} from '../../../../sys/internal-api';
import {
    CorrectnessTableField,
    EnumCorrectnessTableField,
    IntegerArrayCorrectnessTableField,
    LitIvemIdCorrectnessTableField,
    StringCorrectnessTableField,
    TableField
} from '../../field/internal-api';
import {
    CorrectnessTableValue,
    ExchangeIdCorrectnessTableValue,
    IvemClassIdCorrectnessTableValue,
    LitIvemIdCorrectnessTableValue,
    MarketIdArrayCorrectnessTableValue,
    MarketIdCorrectnessTableValue,
    PublisherSubscriptionDataTypeIdArrayCorrectnessTableValue,
    StringCorrectnessTableValue
} from '../../value/internal-api';
import { TypedTableFieldSourceDefinition } from './typed-table-field-source-definition';
import { TypedTableFieldSourceDefinitionCachingFactoryService } from './typed-table-field-source-definition-caching-factory-service';

export class LitIvemBaseDetailTableFieldSourceDefinition extends TypedTableFieldSourceDefinition {
    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(LitIvemBaseDetailTableFieldSourceDefinition.typeId);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: LitIvemBaseDetail.Field.Id) {
        return LitIvemBaseDetailTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: LitIvemBaseDetail.Field.Id) {
        const sourcelessFieldName = LitIvemBaseDetailTableFieldSourceDefinition.Field.getNameById(id);
        return this.encodeFieldName(sourcelessFieldName);
    }

    getSupportedFieldNameById(id: LitIvemBaseDetail.Field.Id) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('LIBDTFSDGSFNBI30499', LitIvemBaseDetail.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }

    private createFieldDefinitions() {
        const result = new Array<TableField.Definition>(LitIvemBaseDetailTableFieldSourceDefinition.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < LitIvemBaseDetailTableFieldSourceDefinition.Field.count; fieldIdx++) {
            const sourcelessFieldName = LitIvemBaseDetailTableFieldSourceDefinition.Field.getName(fieldIdx);
            const dataTypeId = LitIvemBaseDetailTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = LitIvemBaseDetailTableFieldSourceDefinition.Field.getTableFieldConstructor(fieldIdx);
            const valueConstructor = LitIvemBaseDetailTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);

            result[idx++] = new TableField.Definition(
                this,
                sourcelessFieldName,
                LitIvemBaseDetailTableFieldSourceDefinition.Field.getHeading(fieldIdx),
                textAlign,
                fieldConstructor,
                valueConstructor,
            );
        }

        return result;
    }
}

export namespace LitIvemBaseDetailTableFieldSourceDefinition {
    export const typeId = TypedTableFieldSourceDefinition.TypeId.LitIvemBaseDetail;
    export type TypeId = typeof typeId;

    export namespace Field {
        const unsupportedIds: LitIvemBaseDetail.Field.Id[] = [];
        export const count = LitIvemBaseDetail.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: LitIvemBaseDetail.Field.Id;
            readonly fieldConstructor: CorrectnessTableField.Constructor;
            readonly valueConstructor: CorrectnessTableValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(LitIvemBaseDetail.Field.idCount);

        function idToTableGridConstructors(id: LitIvemBaseDetail.Field.Id):
            TypedTableFieldSourceDefinition.CorrectnessTableGridConstructors {
            switch (id) {
                case LitIvemBaseDetail.Field.Id.Id:
                    return [LitIvemIdCorrectnessTableField, LitIvemIdCorrectnessTableValue];
                case LitIvemBaseDetail.Field.Id.Code:
                    return [StringCorrectnessTableField, StringCorrectnessTableValue];
                case LitIvemBaseDetail.Field.Id.MarketId:
                    return [EnumCorrectnessTableField, MarketIdCorrectnessTableValue];
                case LitIvemBaseDetail.Field.Id.IvemClassId:
                    return [EnumCorrectnessTableField, IvemClassIdCorrectnessTableValue];
                case LitIvemBaseDetail.Field.Id.SubscriptionDataTypeIds:
                    return [IntegerArrayCorrectnessTableField, PublisherSubscriptionDataTypeIdArrayCorrectnessTableValue];
                case LitIvemBaseDetail.Field.Id.TradingMarketIds:
                    return [IntegerArrayCorrectnessTableField, MarketIdArrayCorrectnessTableValue];
                case LitIvemBaseDetail.Field.Id.Name:
                    return [StringCorrectnessTableField, StringCorrectnessTableValue];
                case LitIvemBaseDetail.Field.Id.ExchangeId:
                    return [EnumCorrectnessTableField, ExchangeIdCorrectnessTableValue];
                case LitIvemBaseDetail.Field.Id.AlternateCodes:
                    return [StringCorrectnessTableField, StringCorrectnessTableValue];
                default:
                    throw new UnreachableCaseError('LIBDTFDSFITTGC2039994', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return LitIvemBaseDetail.Field.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: LitIvemBaseDetail.Field.Id) {
            return LitIvemBaseDetail.Field.idToName(id);
        }

        export function getHeading(fieldIdx: Integer) {
            return LitIvemBaseDetail.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return LitIvemBaseDetail.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: LitIvemBaseDetail.Field.Id) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: LitIvemBaseDetail.Field.Id) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseFieldStatic() {
            let fieldIdx = 0;
            for (let id = 0; id < LitIvemBaseDetail.Field.idCount; id++) {
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
        sourceTypeId: LitIvemBaseDetailTableFieldSourceDefinition.TypeId;
        id: LitIvemBaseDetail.Field.Id;
    }

    export function get(cachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService): LitIvemBaseDetailTableFieldSourceDefinition {
        return cachingFactoryService.get(typeId) as LitIvemBaseDetailTableFieldSourceDefinition;
    }

    export function initialiseStatic() {
        Field.initialiseFieldStatic();
    }
}
