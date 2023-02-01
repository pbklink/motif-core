/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MyxLitIvemAttributes } from '../../../../adi/adi-internal-api';
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
    IntegerCorrectnessTableField,
    NumberCorrectnessTableField,
    TableField
} from '../../field/grid-table-field-internal-api';
import {
    CorrectnessTableValue,
    DeliveryBasisIdMyxLitIvemAttributeCorrectnessTableValue,
    IntegerCorrectnessTableValue,
    MarketClassificationIdMyxLitIvemAttributeCorrectnessTableValue,
    PercentageCorrectnessTableValue,
    ShortSellTypeIdArrayMyxLitIvemAttributeCorrectnessTableValue
} from '../../value/grid-table-value-internal-api';
import { TableFieldSourceDefinition } from './table-field-source-definition';

export class MyxLitIvemAttributesTableFieldSourceDefinition extends TableFieldSourceDefinition {
    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(TableFieldSourceDefinition.TypeId.MyxLitIvemAttributes);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: MyxLitIvemAttributes.Field.Id) {
        return MyxLitIvemAttributesTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: MyxLitIvemAttributes.Field.Id) {
        const sourcelessFieldName = MyxLitIvemAttributesTableFieldSourceDefinition.Field.getNameById(id);
        return CommaText.from2Values(this.name, sourcelessFieldName);
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
            const fieldName = CommaText.from2Values(this.name, sourcelessFieldName);

            const dataTypeId = MyxLitIvemAttributesTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = MyxLitIvemAttributesTableFieldSourceDefinition.Field.getTableFieldConstructor(fieldIdx);
            const valueConstructor = MyxLitIvemAttributesTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);

            result[idx++] = new TableField.Definition(
                fieldName,
                this,
                MyxLitIvemAttributesTableFieldSourceDefinition.Field.getHeading(fieldIdx),
                textAlign,
                sourcelessFieldName,
                fieldConstructor,
                valueConstructor,
            );
        }

        return result;
    }
}

export namespace MyxLitIvemAttributesTableFieldSourceDefinition {
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

    export function initialiseStatic() {
        Field.initialiseFieldStatic();
    }
}
