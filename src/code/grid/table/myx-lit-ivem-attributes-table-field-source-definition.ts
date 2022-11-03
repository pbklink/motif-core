/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FieldDataType, FieldDataTypeId, MyxLitIvemAttributes } from '../../adi/adi-internal-api';
import { AssertInternalError, CommaText, Integer, UnreachableCaseError } from '../../sys/sys-internal-api';
import { TextFormatterService } from '../../text-format/text-format-internal-api';
import { TableFieldCustomHeadingsService } from './table-field-custom-headings-service';
import { TableFieldSourceDefinition } from './table-field-source-definition';
import {
    CorrectnessTableGridField,
    EnumDataItemTableGridField,
    IntegerArrayDataItemTableGridField,
    IntegerDataItemTableGridField,
    NumberDataItemTableGridField
} from './table-grid-field';
import {
    CorrectnessTableGridValue,
    DeliveryBasisIdMyxLitIvemAttributeCorrectnessTableGridValue,
    IntegerCorrectnessTableGridValue,
    MarketClassificationIdMyxLitIvemAttributeCorrectnessTableGridValue,
    PercentageCorrectnessTableGridValue,
    ShortSellTypeIdArrayMyxLitIvemAttributeCorrectnessTableGridValue
} from './table-grid-value';

export class MyxLitIvemAttributesTableFieldSourceDefinition extends TableFieldSourceDefinition {

    constructor(textFormatterService: TextFormatterService, customHeadingsService: TableFieldCustomHeadingsService) {
        const fieldInfos = MyxLitIvemAttributesTableFieldSourceDefinition.createFieldInfos(customHeadingsService);

        super(
            TableFieldSourceDefinition.TypeId.MyxLitIvemAttributes,
            MyxLitIvemAttributesTableFieldSourceDefinition.sourceName,
            textFormatterService,
            customHeadingsService,
            fieldInfos
        );
    }

    isFieldSupported(id: MyxLitIvemAttributes.Field.Id) {
        return MyxLitIvemAttributesTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: MyxLitIvemAttributes.Field.Id) {
        const sourcelessFieldName = MyxLitIvemAttributesTableFieldSourceDefinition.Field.getNameById(id);
        return CommaText.from2Values(this.sourceName, sourcelessFieldName);
    }

    getSupportedFieldNameById(id: MyxLitIvemAttributes.Field.Id) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('MLIATFSDGSFNBI30699', MyxLitIvemAttributes.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }
}

export namespace MyxLitIvemAttributesTableFieldSourceDefinition {
    export type SourceName = typeof sourceName;
    export const sourceName = 'MyxSA';

    export namespace Field {
        const unsupportedIds: MyxLitIvemAttributes.Field.Id[] = [];
        export const count = MyxLitIvemAttributes.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: MyxLitIvemAttributes.Field.Id;
            readonly fieldConstructor: CorrectnessTableGridField.Constructor;
            readonly valueConstructor: CorrectnessTableGridValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(MyxLitIvemAttributes.Field.idCount);

        function idToTableGridConstructors(id: MyxLitIvemAttributes.Field.Id):
            TableFieldSourceDefinition.CorrectnessTableGridConstructors {
            switch (id) {
                case MyxLitIvemAttributes.Field.Id.Category:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
                case MyxLitIvemAttributes.Field.Id.MarketClassification:
                    return [EnumDataItemTableGridField, MarketClassificationIdMyxLitIvemAttributeCorrectnessTableGridValue];
                case MyxLitIvemAttributes.Field.Id.DeliveryBasis:
                    return [EnumDataItemTableGridField, DeliveryBasisIdMyxLitIvemAttributeCorrectnessTableGridValue];
                case MyxLitIvemAttributes.Field.Id.MaxRSS:
                    return [NumberDataItemTableGridField, PercentageCorrectnessTableGridValue];
                case MyxLitIvemAttributes.Field.Id.Sector:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
                case MyxLitIvemAttributes.Field.Id.Short:
                    return [IntegerArrayDataItemTableGridField, ShortSellTypeIdArrayMyxLitIvemAttributeCorrectnessTableGridValue];
                case MyxLitIvemAttributes.Field.Id.ShortSuspended:
                    return [IntegerArrayDataItemTableGridField, ShortSellTypeIdArrayMyxLitIvemAttributeCorrectnessTableGridValue];
                case MyxLitIvemAttributes.Field.Id.SubSector:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
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

        export function getTableGridFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableGridValueConstructor(fieldIdx: Integer) {
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

    export function createFieldInfos(customHeadingsService: TableFieldCustomHeadingsService) {
        const result = new Array<TableFieldSourceDefinition.FieldInfo>(MyxLitIvemAttributesTableFieldSourceDefinition.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < MyxLitIvemAttributesTableFieldSourceDefinition.Field.count; fieldIdx++) {
            const sourcelessFieldName = MyxLitIvemAttributesTableFieldSourceDefinition.Field.getName(fieldIdx);
            const name = CommaText.from2Values(sourceName, sourcelessFieldName);
            let heading: string;
            const customHeading = customHeadingsService.tryGetFieldHeading(sourceName, sourcelessFieldName);
            if (customHeading !== undefined) {
                heading = customHeading;
            } else {
                heading = MyxLitIvemAttributesTableFieldSourceDefinition.Field.getHeading(fieldIdx);
            }

            const dataTypeId = MyxLitIvemAttributesTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = MyxLitIvemAttributesTableFieldSourceDefinition.Field.getTableGridFieldConstructor(fieldIdx);
            const valueConstructor = MyxLitIvemAttributesTableFieldSourceDefinition.Field.getTableGridValueConstructor(fieldIdx);

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
