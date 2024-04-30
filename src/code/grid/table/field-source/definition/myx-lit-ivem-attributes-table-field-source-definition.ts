/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevHorizontalAlignId } from '@xilytix/revgrid';
import { MyxLitIvemAttributes } from '../../../../adi/internal-api';
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
    IntegerArrayCorrectnessTableField,
    IntegerCorrectnessTableField,
    NumberCorrectnessTableField,
    TableField
} from '../../field/internal-api';
import {
    CorrectnessTableValue,
    DeliveryBasisIdMyxLitIvemAttributeCorrectnessTableValue,
    IntegerCorrectnessTableValue,
    MarketClassificationIdMyxLitIvemAttributeCorrectnessTableValue,
    PercentageCorrectnessTableValue,
    ShortSellTypeIdArrayMyxLitIvemAttributeCorrectnessTableValue
} from '../../value/internal-api';
import { TableFieldSourceDefinition } from './table-field-source-definition';
import { TableFieldSourceDefinitionCachingFactoryService } from './table-field-source-definition-caching-factory-service';

export class MyxLitIvemAttributesTableFieldSourceDefinition extends TableFieldSourceDefinition {
    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(MyxLitIvemAttributesTableFieldSourceDefinition.typeId);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: MyxLitIvemAttributes.Field.Id) {
        return MyxLitIvemAttributesTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: MyxLitIvemAttributes.Field.Id) {
        const sourcelessFieldName = MyxLitIvemAttributesTableFieldSourceDefinition.Field.getNameById(id);
        return this.encodeFieldName(sourcelessFieldName);
    }

    getSupportedFieldNameById(id: MyxLitIvemAttributes.Field.Id) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('MLIATFSDGSFNBI30699', MyxLitIvemAttributes.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }

    private createFieldDefinitions() {
        const result = new Array<TableField.Definition>(MyxLitIvemAttributesTableFieldSourceDefinition.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < MyxLitIvemAttributesTableFieldSourceDefinition.Field.count; fieldIdx++) {
            const sourcelessFieldName = MyxLitIvemAttributesTableFieldSourceDefinition.Field.getName(fieldIdx);
            const dataTypeId = MyxLitIvemAttributesTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlignId = FieldDataType.idIsNumber(dataTypeId) ? RevHorizontalAlignId.Right : RevHorizontalAlignId.Left;
            const fieldConstructor = MyxLitIvemAttributesTableFieldSourceDefinition.Field.getTableFieldConstructor(fieldIdx);
            const valueConstructor = MyxLitIvemAttributesTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);

            result[idx++] = new TableField.Definition(
                this,
                sourcelessFieldName,
                MyxLitIvemAttributesTableFieldSourceDefinition.Field.getHeading(fieldIdx),
                textAlignId,
                fieldConstructor,
                valueConstructor,
            );
        }

        return result;
    }
}

export namespace MyxLitIvemAttributesTableFieldSourceDefinition {
    export const typeId = TableFieldSourceDefinition.TypeId.MyxLitIvemAttributes;
    export type TypeId = typeof typeId;

    export namespace Field {
        const unsupportedIds: MyxLitIvemAttributes.Field.Id[] = [];
        export const count = MyxLitIvemAttributes.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: MyxLitIvemAttributes.Field.Id;
            readonly fieldConstructor: CorrectnessTableField.Constructor;
            readonly valueConstructor: CorrectnessTableValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(MyxLitIvemAttributes.Field.idCount);

        function idToTableGridConstructors(id: MyxLitIvemAttributes.Field.Id):
            TableFieldSourceDefinition.CorrectnessTableGridConstructors {
            switch (id) {
                case MyxLitIvemAttributes.Field.Id.Category:
                    return [IntegerCorrectnessTableField, IntegerCorrectnessTableValue];
                case MyxLitIvemAttributes.Field.Id.MarketClassification:
                    return [EnumCorrectnessTableField, MarketClassificationIdMyxLitIvemAttributeCorrectnessTableValue];
                case MyxLitIvemAttributes.Field.Id.DeliveryBasis:
                    return [EnumCorrectnessTableField, DeliveryBasisIdMyxLitIvemAttributeCorrectnessTableValue];
                case MyxLitIvemAttributes.Field.Id.MaxRSS:
                    return [NumberCorrectnessTableField, PercentageCorrectnessTableValue];
                case MyxLitIvemAttributes.Field.Id.Sector:
                    return [IntegerCorrectnessTableField, IntegerCorrectnessTableValue];
                case MyxLitIvemAttributes.Field.Id.Short:
                    return [IntegerArrayCorrectnessTableField, ShortSellTypeIdArrayMyxLitIvemAttributeCorrectnessTableValue];
                case MyxLitIvemAttributes.Field.Id.ShortSuspended:
                    return [IntegerArrayCorrectnessTableField, ShortSellTypeIdArrayMyxLitIvemAttributeCorrectnessTableValue];
                case MyxLitIvemAttributes.Field.Id.SubSector:
                    return [IntegerCorrectnessTableField, IntegerCorrectnessTableValue];
                default:
                    throw new UnreachableCaseError('MLIATFDSFITTGC200012', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return MyxLitIvemAttributes.Field.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: MyxLitIvemAttributes.Field.Id) {
            return MyxLitIvemAttributes.Field.idToName(id);
        }

        export function getHeading(fieldIdx: Integer) {
            return MyxLitIvemAttributes.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return MyxLitIvemAttributes.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: MyxLitIvemAttributes.Field.Id) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: MyxLitIvemAttributes.Field.Id) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseFieldStatic() {
            let fieldIdx = 0;
            for (let id = 0; id < MyxLitIvemAttributes.Field.idCount; id++) {
                if (unsupportedIds.includes(id)) {
                    idFieldIndices[id] = -1;
                } else {
                    idFieldIndices[id] = fieldIdx;

                    const [fieldConstructor, valueConstructor] = idToTableGridConstructors(id);
                    infos[fieldIdx++] = {
                        id,
                        fieldConstructor,
                        valueConstructor,
                    } as const;
                }
            }
        }
    }

    export interface FieldId extends TableFieldSourceDefinition.FieldId {
        sourceTypeId: MyxLitIvemAttributesTableFieldSourceDefinition.TypeId;
        id: MyxLitIvemAttributes.Field.Id;
    }

    export function get(cachingFactoryService: TableFieldSourceDefinitionCachingFactoryService): MyxLitIvemAttributesTableFieldSourceDefinition {
        return cachingFactoryService.get(typeId) as MyxLitIvemAttributesTableFieldSourceDefinition;
    }

    export function initialiseStatic() {
        Field.initialiseFieldStatic();
    }
}
