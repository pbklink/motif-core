/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FieldDataType, FieldDataTypeId, LitIvemDetail } from '../../adi/adi-internal-api';
import { AssertInternalError, CommaText, Integer, UnreachableCaseError } from '../../sys/sys-internal-api';
import { TextFormatterService } from '../../text-format/text-format-internal-api';
import { TableFieldCustomHeadingsService } from './table-field-custom-headings-service';
import { TableFieldSourceDefinition } from './table-field-source-definition';
import {
    CorrectnessTableGridField,
    EnumDataItemTableGridField,
    IntegerArrayDataItemTableGridField,
    LitIvemIdDataItemTableGridField,
    StringDataItemTableGridField
} from './table-grid-field';
import {
    CorrectnessTableGridValue,
    ExchangeIdCorrectnessTableGridValue,
    IvemClassIdCorrectnessTableGridValue,
    LitIvemIdCorrectnessTableGridValue,
    MarketIdArrayCorrectnessTableGridValue,
    MarketIdCorrectnessTableGridValue,
    StringCorrectnessTableGridValue,
    ZenithSubscriptionDataIdArrayCorrectnessTableGridValue
} from './table-grid-value';

export class LitIvemBaseDetailTableFieldSourceDefinition extends TableFieldSourceDefinition {

    constructor(textFormatterService: TextFormatterService, customHeadingsService: TableFieldCustomHeadingsService) {
        const fieldInfos = LitIvemBaseDetailTableFieldSourceDefinition.createFieldInfos(customHeadingsService);

        super(
            textFormatterService,
            customHeadingsService,
            TableFieldSourceDefinition.TypeId.LitIvemBaseDetail,
            LitIvemBaseDetailTableFieldSourceDefinition.sourceName,
            fieldInfos
        );
    }

    isFieldSupported(id: LitIvemDetail.BaseField.Id) {
        return LitIvemBaseDetailTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: LitIvemDetail.BaseField.Id) {
        const sourcelessFieldName = LitIvemBaseDetailTableFieldSourceDefinition.Field.getNameById(id);
        return CommaText.from2Values(this.sourceName, sourcelessFieldName);
    }

    getSupportedFieldNameById(id: LitIvemDetail.BaseField.Id) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('LIBDTFSDGSFNBI30499', LitIvemDetail.BaseField.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }
}

export namespace LitIvemBaseDetailTableFieldSourceDefinition {
    export type SourceName = typeof sourceName;
    export const sourceName = 'Lib';

    export namespace Field {
        const unsupportedIds: LitIvemDetail.BaseField.Id[] = [];
        export const count = LitIvemDetail.BaseField.idCount - unsupportedIds.length;

        interface Info {
            readonly id: LitIvemDetail.BaseField.Id;
            readonly fieldConstructor: CorrectnessTableGridField.Constructor;
            readonly valueConstructor: CorrectnessTableGridValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(LitIvemDetail.BaseField.idCount);

        function idToTableGridConstructors(id: LitIvemDetail.BaseField.Id):
            TableFieldSourceDefinition.CorrectnessTableGridConstructors {
            switch (id) {
                case LitIvemDetail.BaseField.Id.Id:
                    return [LitIvemIdDataItemTableGridField, LitIvemIdCorrectnessTableGridValue];
                case LitIvemDetail.BaseField.Id.Code:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case LitIvemDetail.BaseField.Id.MarketId:
                    return [EnumDataItemTableGridField, MarketIdCorrectnessTableGridValue];
                case LitIvemDetail.BaseField.Id.IvemClassId:
                    return [EnumDataItemTableGridField, IvemClassIdCorrectnessTableGridValue];
                case LitIvemDetail.BaseField.Id.SubscriptionDataIds:
                    return [IntegerArrayDataItemTableGridField, ZenithSubscriptionDataIdArrayCorrectnessTableGridValue];
                case LitIvemDetail.BaseField.Id.TradingMarketIds:
                    return [IntegerArrayDataItemTableGridField, MarketIdArrayCorrectnessTableGridValue];
                case LitIvemDetail.BaseField.Id.Name:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case LitIvemDetail.BaseField.Id.ExchangeId:
                    return [EnumDataItemTableGridField, ExchangeIdCorrectnessTableGridValue];
                case LitIvemDetail.BaseField.Id.AlternateCodes:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
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

        export function getTableGridFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableGridValueConstructor(fieldIdx: Integer) {
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

    export function createFieldInfos(customHeadingsService: TableFieldCustomHeadingsService) {
        const result = new Array<TableFieldSourceDefinition.FieldInfo>(LitIvemBaseDetailTableFieldSourceDefinition.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < LitIvemBaseDetailTableFieldSourceDefinition.Field.count; fieldIdx++) {
            const sourcelessFieldName = LitIvemBaseDetailTableFieldSourceDefinition.Field.getName(fieldIdx);
            const name = CommaText.from2Values(sourceName, sourcelessFieldName);
            let heading: string;
            const customHeading = customHeadingsService.tryGetFieldHeading(sourceName, sourcelessFieldName);
            if (customHeading !== undefined) {
                heading = customHeading;
            } else {
                heading = LitIvemBaseDetailTableFieldSourceDefinition.Field.getHeading(fieldIdx);
            }

            const dataTypeId = LitIvemBaseDetailTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = LitIvemBaseDetailTableFieldSourceDefinition.Field.getTableGridFieldConstructor(fieldIdx);
            const valueConstructor = LitIvemBaseDetailTableFieldSourceDefinition.Field.getTableGridValueConstructor(fieldIdx);

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
