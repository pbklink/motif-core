/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FieldDataType, FieldDataTypeId, Order } from '../../adi/adi-internal-api';
import { AssertInternalError, CommaText, Integer, UnreachableCaseError } from '../../sys/sys-internal-api';
import { TextFormatterService } from '../../text-format/text-format-internal-api';
import { TableFieldCustomHeadingsService } from './table-field-custom-headings-service';
import { TableFieldSourceDefinition } from './table-field-source-definition';
import {
    BooleanDataItemTableGridField,
    CorrectnessTableGridField,
    DecimalDataItemTableGridField,
    EnumDataItemTableGridField,
    IntegerArrayDataItemTableGridField,
    IntegerDataItemTableGridField,
    SourceTzOffsetDateTimeDataItemTableGridField,
    StringArrayDataItemTableGridField,
    StringDataItemTableGridField
} from './table-grid-field';
import {
    CorrectnessTableGridValue,
    CurrencyIdCorrectnessTableGridValue,
    DataEnvironmentIdCorrectnessTableGridValue,
    DecimalCorrectnessTableGridValue,
    EquityOrderTypeIdCorrectnessTableGridValue,
    ExchangeIdCorrectnessTableGridValue,
    GridOrderTriggerTypeIdCorrectnessTableGridValue,
    IntegerCorrectnessTableGridValue,
    IvemClassIdCorrectnessTableGridValue,
    MarketBoardIdCorrectnessTableGridValue,
    MarketIdCorrectnessTableGridValue,
    OrderExtendedSideIdCorrectnessTableGridValue,
    OrderPriceUnitTypeIdCorrectnessTableGridValue,
    OrderRouteAlgorithmIdCorrectnessTableGridValue,
    OrderShortSellTypeIdCorrectnessTableGridValue,
    OrderSideIdCorrectnessTableGridValue,
    OrderStatusAllowIdArrayCorrectnessTableGridValue,
    OrderStatusReasonIdArrayCorrectnessTableGridValue,
    PhysicalDeliveryCorrectnessTableGridValue,
    PriceCorrectnessTableGridValue,
    SourceTzOffsetDateTimeDateCorrectnessTableGridValue,
    StringArrayCorrectnessTableGridValue,
    StringCorrectnessTableGridValue,
    TimeInForceIdCorrectnessTableGridValue
} from "./table-grid-value";

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
            readonly fieldConstructor: CorrectnessTableGridField.Constructor;
            readonly valueConstructor: CorrectnessTableGridValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(Order.Field.count);

        function idToTableGridConstructors(id: Order.FieldId):
            TableFieldSourceDefinition.CorrectnessTableGridConstructors {
            switch (id) {
                case Order.FieldId.Id:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Order.FieldId.AccountId:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Order.FieldId.ExternalId:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Order.FieldId.DepthOrderId:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Order.FieldId.Status:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Order.FieldId.StatusAllowIds:
                    return [IntegerArrayDataItemTableGridField, OrderStatusAllowIdArrayCorrectnessTableGridValue];
                case Order.FieldId.StatusReasonIds:
                    return [IntegerArrayDataItemTableGridField, OrderStatusReasonIdArrayCorrectnessTableGridValue];
                case Order.FieldId.MarketId:
                    return [EnumDataItemTableGridField, MarketIdCorrectnessTableGridValue];
                case Order.FieldId.TradingMarket:
                    return [EnumDataItemTableGridField, MarketBoardIdCorrectnessTableGridValue];
                case Order.FieldId.CurrencyId:
                    return [EnumDataItemTableGridField, CurrencyIdCorrectnessTableGridValue];
                case Order.FieldId.EstimatedBrokerage:
                    return [DecimalDataItemTableGridField, PriceCorrectnessTableGridValue];
                case Order.FieldId.CurrentBrokerage:
                    return [DecimalDataItemTableGridField, PriceCorrectnessTableGridValue];
                case Order.FieldId.EstimatedTax:
                    return [DecimalDataItemTableGridField, PriceCorrectnessTableGridValue];
                case Order.FieldId.CurrentTax:
                    return [DecimalDataItemTableGridField, PriceCorrectnessTableGridValue];
                case Order.FieldId.CurrentValue:
                    return [DecimalDataItemTableGridField, DecimalCorrectnessTableGridValue];
                case Order.FieldId.CreatedDate:
                    // return [SourceTzOffsetDateTimeDataItemTableGridField, SourceTzOffsetDateTimeCorrectnessTableGridValue];
                    return [SourceTzOffsetDateTimeDataItemTableGridField, SourceTzOffsetDateTimeDateCorrectnessTableGridValue];
                case Order.FieldId.UpdatedDate:
                    // return [SourceTzOffsetDateTimeDataItemTableGridField, SourceTzOffsetDateTimeCorrectnessTableGridValue];
                    return [SourceTzOffsetDateTimeDataItemTableGridField, SourceTzOffsetDateTimeDateCorrectnessTableGridValue];
                case Order.FieldId.StyleId:
                    return [EnumDataItemTableGridField, IvemClassIdCorrectnessTableGridValue];
                case Order.FieldId.Children:
                    return [StringArrayDataItemTableGridField, StringArrayCorrectnessTableGridValue];
                case Order.FieldId.ExecutedQuantity:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
                case Order.FieldId.AveragePrice:
                    return [DecimalDataItemTableGridField, PriceCorrectnessTableGridValue];
                case Order.FieldId.ExchangeId:
                    return [EnumDataItemTableGridField, ExchangeIdCorrectnessTableGridValue];
                case Order.FieldId.Code:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Order.FieldId.SideId:
                    return [EnumDataItemTableGridField, OrderSideIdCorrectnessTableGridValue];
                case Order.FieldId.ExtendedSideId:
                    return [EnumDataItemTableGridField, OrderExtendedSideIdCorrectnessTableGridValue];
                case Order.FieldId.BrokerageSchedule:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Order.FieldId.EquityOrderTypeId:
                    return [EnumDataItemTableGridField, EquityOrderTypeIdCorrectnessTableGridValue];
                case Order.FieldId.LimitPrice:
                    return [DecimalDataItemTableGridField, PriceCorrectnessTableGridValue];
                case Order.FieldId.Quantity:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
                case Order.FieldId.HiddenQuantity:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
                case Order.FieldId.MinimumQuantity:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
                case Order.FieldId.TimeInForceId:
                    return [EnumDataItemTableGridField, TimeInForceIdCorrectnessTableGridValue];
                case Order.FieldId.ExpiryDate:
                    return [SourceTzOffsetDateTimeDataItemTableGridField, SourceTzOffsetDateTimeDateCorrectnessTableGridValue];
                case Order.FieldId.ShortSellTypeId:
                    return [EnumDataItemTableGridField, OrderShortSellTypeIdCorrectnessTableGridValue];
                case Order.FieldId.UnitTypeId:
                    return [EnumDataItemTableGridField, OrderPriceUnitTypeIdCorrectnessTableGridValue];
                case Order.FieldId.UnitAmount:
                    return [DecimalDataItemTableGridField, DecimalCorrectnessTableGridValue];
                case Order.FieldId.ManagedFundCurrency:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Order.FieldId.PhysicalDelivery:
                    return [BooleanDataItemTableGridField, PhysicalDeliveryCorrectnessTableGridValue];
                case Order.FieldId.RouteAlgorithmId:
                    return [EnumDataItemTableGridField, OrderRouteAlgorithmIdCorrectnessTableGridValue];
                case Order.FieldId.RouteMarketId:
                    return [EnumDataItemTableGridField, MarketIdCorrectnessTableGridValue];
                case Order.FieldId.TriggerTypeId:
                    return [EnumDataItemTableGridField, GridOrderTriggerTypeIdCorrectnessTableGridValue];
                case Order.FieldId.TriggerValue:
                    return [DecimalDataItemTableGridField, PriceCorrectnessTableGridValue];
                case Order.FieldId.TriggerExtraParams:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Order.FieldId.EnvironmentId:
                    return [EnumDataItemTableGridField, DataEnvironmentIdCorrectnessTableGridValue];

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

        export function getTableGridFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableGridValueConstructor(fieldIdx: Integer) {
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
            const fieldConstructor = OrderTableFieldSourceDefinition.Field.getTableGridFieldConstructor(fieldIdx);
            const valueConstructor = OrderTableFieldSourceDefinition.Field.getTableGridValueConstructor(fieldIdx);

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
