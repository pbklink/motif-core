/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FieldDataType, FieldDataTypeId, Order } from '../../../../adi/adi-internal-api';
import { AssertInternalError, CommaText, Integer, UnreachableCaseError } from '../../../../sys/sys-internal-api';
import { TextFormatterService } from '../../../../text-format/text-format-internal-api';
import {
    BooleanDataItemTableField,
    CorrectnessTableField,
    DecimalDataItemTableField,
    EnumDataItemTableField,
    IntegerArrayDataItemTableField,
    IntegerDataItemTableField,
    SourceTzOffsetDateTimeDataItemTableField,
    StringArrayDataItemTableField,
    StringDataItemTableField
} from '../../field/grid-table-field-internal-api';
import {
    CorrectnessTableValue,
    CurrencyIdCorrectnessTableValue,
    DataEnvironmentIdCorrectnessTableValue,
    DecimalCorrectnessTableValue,
    EquityOrderTypeIdCorrectnessTableValue,
    ExchangeIdCorrectnessTableValue,
    GridOrderTriggerTypeIdCorrectnessTableValue,
    IntegerCorrectnessTableValue,
    IvemClassIdCorrectnessTableValue,
    MarketBoardIdCorrectnessTableValue,
    MarketIdCorrectnessTableValue,
    OrderExtendedSideIdCorrectnessTableValue,
    OrderPriceUnitTypeIdCorrectnessTableValue,
    OrderRouteAlgorithmIdCorrectnessTableValue,
    OrderShortSellTypeIdCorrectnessTableValue,
    OrderSideIdCorrectnessTableValue,
    OrderStatusAllowIdArrayCorrectnessTableValue,
    OrderStatusReasonIdArrayCorrectnessTableValue,
    PhysicalDeliveryCorrectnessTableValue,
    PriceCorrectnessTableValue,
    SourceTzOffsetDateTimeDateCorrectnessTableValue,
    StringArrayCorrectnessTableValue,
    StringCorrectnessTableValue,
    TimeInForceIdCorrectnessTableValue
} from '../../value/grid-table-value-internal-api';
import { TableFieldCustomHeadingsService } from './table-field-custom-headings-service';
import { TableFieldSourceDefinition } from './table-field-source-definition';

export class OrderTableFieldSourceDefinition extends TableFieldSourceDefinition {

    constructor(textFormatterService: TextFormatterService, customHeadingsService: TableFieldCustomHeadingsService) {
        const fieldInfos = OrderTableFieldSourceDefinition.createFieldInfos(customHeadingsService);

        super(
            textFormatterService,
            customHeadingsService,
            TableFieldSourceDefinition.TypeId.OrdersDataItem,
            OrderTableFieldSourceDefinition.sourceName,
            fieldInfos
        );
    }

    isFieldSupported(id: Order.FieldId) {
        return OrderTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: Order.FieldId) {
        const sourcelessFieldName = OrderTableFieldSourceDefinition.Field.getNameById(id);
        return CommaText.from2Values(this.sourceName, sourcelessFieldName);
    }

    getSupportedFieldNameById(id: Order.FieldId) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('OTFSDGSFNBI31299', Order.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }
}

export namespace OrderTableFieldSourceDefinition {
    export type SourceName = typeof sourceName;
    export const sourceName = 'Odi';

    export namespace Field {
        const unsupportedIds: Order.FieldId[] = [];
        export const count = Order.Field.count - unsupportedIds.length;

        interface Info {
            readonly id: Order.FieldId;
            readonly fieldConstructor: CorrectnessTableField.Constructor;
            readonly valueConstructor: CorrectnessTableValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(Order.Field.count);

        function idToTableGridConstructors(id: Order.FieldId):
            TableFieldSourceDefinition.CorrectnessTableGridConstructors {
            switch (id) {
                case Order.FieldId.Id:
                    return [StringDataItemTableField, StringCorrectnessTableValue];
                case Order.FieldId.AccountId:
                    return [StringDataItemTableField, StringCorrectnessTableValue];
                case Order.FieldId.ExternalId:
                    return [StringDataItemTableField, StringCorrectnessTableValue];
                case Order.FieldId.DepthOrderId:
                    return [StringDataItemTableField, StringCorrectnessTableValue];
                case Order.FieldId.Status:
                    return [StringDataItemTableField, StringCorrectnessTableValue];
                case Order.FieldId.StatusAllowIds:
                    return [IntegerArrayDataItemTableField, OrderStatusAllowIdArrayCorrectnessTableValue];
                case Order.FieldId.StatusReasonIds:
                    return [IntegerArrayDataItemTableField, OrderStatusReasonIdArrayCorrectnessTableValue];
                case Order.FieldId.MarketId:
                    return [EnumDataItemTableField, MarketIdCorrectnessTableValue];
                case Order.FieldId.TradingMarket:
                    return [EnumDataItemTableField, MarketBoardIdCorrectnessTableValue];
                case Order.FieldId.CurrencyId:
                    return [EnumDataItemTableField, CurrencyIdCorrectnessTableValue];
                case Order.FieldId.EstimatedBrokerage:
                    return [DecimalDataItemTableField, PriceCorrectnessTableValue];
                case Order.FieldId.CurrentBrokerage:
                    return [DecimalDataItemTableField, PriceCorrectnessTableValue];
                case Order.FieldId.EstimatedTax:
                    return [DecimalDataItemTableField, PriceCorrectnessTableValue];
                case Order.FieldId.CurrentTax:
                    return [DecimalDataItemTableField, PriceCorrectnessTableValue];
                case Order.FieldId.CurrentValue:
                    return [DecimalDataItemTableField, DecimalCorrectnessTableValue];
                case Order.FieldId.CreatedDate:
                    // return [SourceTzOffsetDateTimeDataItemTableField, SourceTzOffsetDateTimeCorrectnessTableValue];
                    return [SourceTzOffsetDateTimeDataItemTableField, SourceTzOffsetDateTimeDateCorrectnessTableValue];
                case Order.FieldId.UpdatedDate:
                    // return [SourceTzOffsetDateTimeDataItemTableField, SourceTzOffsetDateTimeCorrectnessTableValue];
                    return [SourceTzOffsetDateTimeDataItemTableField, SourceTzOffsetDateTimeDateCorrectnessTableValue];
                case Order.FieldId.StyleId:
                    return [EnumDataItemTableField, IvemClassIdCorrectnessTableValue];
                case Order.FieldId.Children:
                    return [StringArrayDataItemTableField, StringArrayCorrectnessTableValue];
                case Order.FieldId.ExecutedQuantity:
                    return [IntegerDataItemTableField, IntegerCorrectnessTableValue];
                case Order.FieldId.AveragePrice:
                    return [DecimalDataItemTableField, PriceCorrectnessTableValue];
                case Order.FieldId.ExchangeId:
                    return [EnumDataItemTableField, ExchangeIdCorrectnessTableValue];
                case Order.FieldId.Code:
                    return [StringDataItemTableField, StringCorrectnessTableValue];
                case Order.FieldId.SideId:
                    return [EnumDataItemTableField, OrderSideIdCorrectnessTableValue];
                case Order.FieldId.ExtendedSideId:
                    return [EnumDataItemTableField, OrderExtendedSideIdCorrectnessTableValue];
                case Order.FieldId.BrokerageSchedule:
                    return [StringDataItemTableField, StringCorrectnessTableValue];
                case Order.FieldId.EquityOrderTypeId:
                    return [EnumDataItemTableField, EquityOrderTypeIdCorrectnessTableValue];
                case Order.FieldId.LimitPrice:
                    return [DecimalDataItemTableField, PriceCorrectnessTableValue];
                case Order.FieldId.Quantity:
                    return [IntegerDataItemTableField, IntegerCorrectnessTableValue];
                case Order.FieldId.HiddenQuantity:
                    return [IntegerDataItemTableField, IntegerCorrectnessTableValue];
                case Order.FieldId.MinimumQuantity:
                    return [IntegerDataItemTableField, IntegerCorrectnessTableValue];
                case Order.FieldId.TimeInForceId:
                    return [EnumDataItemTableField, TimeInForceIdCorrectnessTableValue];
                case Order.FieldId.ExpiryDate:
                    return [SourceTzOffsetDateTimeDataItemTableField, SourceTzOffsetDateTimeDateCorrectnessTableValue];
                case Order.FieldId.ShortSellTypeId:
                    return [EnumDataItemTableField, OrderShortSellTypeIdCorrectnessTableValue];
                case Order.FieldId.UnitTypeId:
                    return [EnumDataItemTableField, OrderPriceUnitTypeIdCorrectnessTableValue];
                case Order.FieldId.UnitAmount:
                    return [DecimalDataItemTableField, DecimalCorrectnessTableValue];
                case Order.FieldId.ManagedFundCurrency:
                    return [StringDataItemTableField, StringCorrectnessTableValue];
                case Order.FieldId.PhysicalDelivery:
                    return [BooleanDataItemTableField, PhysicalDeliveryCorrectnessTableValue];
                case Order.FieldId.RouteAlgorithmId:
                    return [EnumDataItemTableField, OrderRouteAlgorithmIdCorrectnessTableValue];
                case Order.FieldId.RouteMarketId:
                    return [EnumDataItemTableField, MarketIdCorrectnessTableValue];
                case Order.FieldId.TriggerTypeId:
                    return [EnumDataItemTableField, GridOrderTriggerTypeIdCorrectnessTableValue];
                case Order.FieldId.TriggerValue:
                    return [DecimalDataItemTableField, PriceCorrectnessTableValue];
                case Order.FieldId.TriggerExtraParams:
                    return [StringDataItemTableField, StringCorrectnessTableValue];
                case Order.FieldId.EnvironmentId:
                    return [EnumDataItemTableField, DataEnvironmentIdCorrectnessTableValue];

                default:
                    throw new UnreachableCaseError('OTFDSFITTGC10049334', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return Order.Field.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: Order.FieldId) {
            return Order.Field.idToName(id);
        }

        export function getHeading(fieldIdx: Integer) {
            return Order.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return Order.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: Order.FieldId) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: Order.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseFieldStatic() {
            let fieldIdx = 0;
            for (let id = 0; id < Order.Field.count; id++) {
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
        const result = new Array<TableFieldSourceDefinition.FieldInfo>(OrderTableFieldSourceDefinition.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < OrderTableFieldSourceDefinition.Field.count; fieldIdx++) {
            const sourcelessFieldName = OrderTableFieldSourceDefinition.Field.getName(fieldIdx);
            const name = CommaText.from2Values(sourceName, sourcelessFieldName);
            let heading: string;
            const customHeading = customHeadingsService.tryGetFieldHeading(sourceName, sourcelessFieldName);
            if (customHeading !== undefined) {
                heading = customHeading;
            } else {
                heading = OrderTableFieldSourceDefinition.Field.getHeading(fieldIdx);
            }

            const dataTypeId = OrderTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = OrderTableFieldSourceDefinition.Field.getTableFieldConstructor(fieldIdx);
            const valueConstructor = OrderTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);

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
