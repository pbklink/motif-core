/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FieldDataType, FieldDataTypeId, Holding } from '../../adi/adi-internal-api';
import { AssertInternalError, CommaText, Integer, UnreachableCaseError } from '../../sys/sys-internal-api';
import { TextFormatterService } from '../../text-format/text-format-internal-api';
import { TableFieldCustomHeadingsService } from './table-field-custom-headings-service';
import { TableFieldSourceDefinition } from './table-field-source-definition';
import {
    CorrectnessTableGridField,
    DecimalDataItemTableGridField,
    EnumDataItemTableGridField,
    IntegerDataItemTableGridField,
    StringDataItemTableGridField
} from "./table-grid-field";
import {
    CorrectnessTableGridValue,
    CurrencyIdCorrectnessTableGridValue,
    ExchangeIdCorrectnessTableGridValue,
    IntegerCorrectnessTableGridValue,
    IvemClassIdCorrectnessTableGridValue,
    PriceCorrectnessTableGridValue,
    StringCorrectnessTableGridValue
} from "./table-grid-value";

export class HoldingTableFieldSourceDefinition extends TableFieldSourceDefinition {

    constructor(textFormatterService: TextFormatterService, customHeadingsService: TableFieldCustomHeadingsService) {
        const fieldInfos = HoldingTableFieldSourceDefinition.createFieldInfos(customHeadingsService);

        super(
            TableFieldSourceDefinition.TypeId.HoldingsDataItem,
            HoldingTableFieldSourceDefinition.sourceName,
            textFormatterService,
            customHeadingsService,
            fieldInfos
        );
    }

    isFieldSupported(id: Holding.FieldId) {
        return HoldingTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: Holding.FieldId) {
        const sourcelessFieldName = HoldingTableFieldSourceDefinition.Field.getNameById(id);
        return CommaText.from2Values(this.sourceName, sourcelessFieldName);
    }

    getSupportedFieldNameById(id: Holding.FieldId) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('HTFSDGSFNBI30399', Holding.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }
}

export namespace HoldingTableFieldSourceDefinition {
    export type SourceName = typeof sourceName;
    export const sourceName = 'Hdi';

    export namespace Field {
        const unsupportedIds: Holding.FieldId[] = [];
        export const count = Holding.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: Holding.FieldId;
            readonly fieldConstructor: CorrectnessTableGridField.Constructor;
            readonly valueConstructor: CorrectnessTableGridValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(Holding.Field.idCount);

        function idToTableGridConstructors(id: Holding.FieldId):
            TableFieldSourceDefinition.CorrectnessTableGridConstructors {
            switch (id) {
                case Holding.FieldId.ExchangeId:
                    return [EnumDataItemTableGridField, ExchangeIdCorrectnessTableGridValue];
                case Holding.FieldId.Code:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Holding.FieldId.AccountId:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Holding.FieldId.StyleId:
                    return [EnumDataItemTableGridField, IvemClassIdCorrectnessTableGridValue];
                case Holding.FieldId.Cost:
                    return [DecimalDataItemTableGridField, PriceCorrectnessTableGridValue];
                case Holding.FieldId.Currency:
                    return [EnumDataItemTableGridField, CurrencyIdCorrectnessTableGridValue];
                case Holding.FieldId.TotalQuantity:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
                case Holding.FieldId.TotalAvailableQuantity:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
                case Holding.FieldId.AveragePrice:
                    return [DecimalDataItemTableGridField, PriceCorrectnessTableGridValue];
                default:
                    throw new UnreachableCaseError('HTFDSFITTGC5948883', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return Holding.Field.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: Holding.FieldId) {
            return Holding.Field.idToName(id);
        }

        export function getHeading(fieldIdx: Integer) {
            return Holding.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return Holding.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableGridFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableGridValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: Holding.FieldId) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: Holding.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseFieldStatic() {
            let fieldIdx = 0;
            for (let id = 0; id < Holding.Field.idCount; id++) {
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
        const result = new Array<TableFieldSourceDefinition.FieldInfo>(HoldingTableFieldSourceDefinition.Field.count);

        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < HoldingTableFieldSourceDefinition.Field.count; fieldIdx++) {
            const sourcelessFieldName = HoldingTableFieldSourceDefinition.Field.getName(fieldIdx);
            const name = CommaText.from2Values(sourceName, sourcelessFieldName);
            let heading: string;
            const customHeading = customHeadingsService.tryGetFieldHeading(sourceName, sourcelessFieldName);
            if (customHeading !== undefined) {
                heading = customHeading;
            } else {
                heading = HoldingTableFieldSourceDefinition.Field.getHeading(fieldIdx);
            }

            const dataTypeId = HoldingTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = HoldingTableFieldSourceDefinition.Field.getTableGridFieldConstructor(fieldIdx);
            const valueConstructor = HoldingTableFieldSourceDefinition.Field.getTableGridValueConstructor(fieldIdx);

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
