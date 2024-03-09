/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DayTradesDataItem, MovementId, TradeFlagId } from '../../../adi/adi-internal-api';
import { StringId, Strings } from '../../../res/res-internal-api';
import {
    DayTradesDataItemRecordTypeIdRenderValue,
    IntegerRenderValue,
    MarketIdRenderValue,
    OrderSideIdRenderValue,
    PriceRenderValue,
    RenderValue,
    SourceTzOffsetDateTimeTimeRenderValue,
    StringArrayRenderValue,
    StringRenderValue,
    TradeAffectsIdArrayRenderValue,
    TradeFlagIdArrayRenderValue,
    TrendIdRenderValue
} from '../../../services/services-internal-api';
import {
    ComparisonResult,
    CorrectnessId,
    GridFieldHorizontalAlign,
    GridRevRecordField,
    Integer,
    SourceTzOffsetDateTime,
    UnreachableCaseError,
    compareArray,
    compareNumber,
    compareUndefinableDecimal,
    compareUndefinableEnum,
    compareUndefinableInteger,
    compareUndefinableString
} from "../../../sys/internal-api";
import { AllowedGridField, GridField, GridFieldDefinition, GridFieldSourceDefinition } from '../../field/grid-field-internal-api';
import { GridLayoutDefinition } from '../../layout/grid-layout-internal-api';

/** @public */
export abstract class DayTradesGridField extends GridField implements GridRevRecordField {
    constructor(
        private readonly _id: DayTradesDataItem.Field.Id,
        definition: GridFieldDefinition,
        private readonly _getDataItemCorrectnessIdEvent: DayTradesGridField.GetDataItemCorrectnessIdEventHandler,
    ) {
        super(definition);
    }

    get isBrokerPrivateData() { return DayTradesDataItem.Field.idToIsBrokerPrivateData(this._id); }

    override getViewValue(record: DayTradesDataItem.Record): RenderValue {
        const { renderValue, cellAttribute } = this.createRenderValue(record);

        // add attributes in correct priority order.  1st will be applied last (highest priority)
        const correctnessId = this._getDataItemCorrectnessIdEvent();
        switch (correctnessId) {
            case CorrectnessId.Suspect: {
                renderValue.addAttribute(RenderValue.DataCorrectnessAttribute.suspect);
                break;
            }
            case CorrectnessId.Error: {
                renderValue.addAttribute(RenderValue.DataCorrectnessAttribute.error);
                break;
            }
            case CorrectnessId.Usable:
            case CorrectnessId.Good: {
                // can do other attributes if usable
                if (cellAttribute !== undefined) {
                    renderValue.addAttribute(cellAttribute);
                }

                switch (record.typeId) {
                    case DayTradesDataItem.Record.TypeId.Cancelled:
                        renderValue.addAttribute(RenderValue.cancelledAttribute);
                        break;
                    case DayTradesDataItem.Record.TypeId.Canceller:
                        renderValue.addAttribute(RenderValue.cancellerAttribute);
                        break;
                }

                const tradeRecord = record.tradeRecord;

                if (tradeRecord.buyCrossRef !== undefined || tradeRecord.sellCrossRef !== undefined) {
                    renderValue.addAttribute(RenderValue.ownOrderAttribute);
                } else {
                    // const buyOrderId = tradeRecord.buyDepthOrderId;
                    // const sellOrderId = tradeRecord.sellDepthOrderId;
                    // const sideId = tradeRecord.orderSideId;

                    // if (sideId !== undefined) {
                    //     if (buyOrderId !== undefined || sellOrderId !== undefined) {
                    //         renderValue.addAttribute(RenderValue.ownOrderAttribute);
                    //     }
                    // }
                }

                break;
            }

            default:
                throw new UnreachableCaseError('TGFGFV229988', correctnessId);
        }


        return renderValue;
    }

    compare(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record) {
        return this.compareValue(left, right, true);
    }

    compareDesc(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record) {
        return this.compareValue(right, left, false);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected addRenderAttributes(renderValue: RenderValue, record: DayTradesDataItem.Record, cellAttribute: RenderValue.Attribute) {

    }

    protected abstract createRenderValue(record: DayTradesDataItem.Record): DayTradesGridField.CreateRenderValueResult;
    protected abstract compareValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean): number;
}

/** @public */
export namespace DayTradesGridField {
    export type Id = DayTradesDataItem.Field.Id;
    export const idCount = DayTradesDataItem.Field.idCount;
    export type GetDataItemCorrectnessIdEventHandler = (this: void) => CorrectnessId;

    export const sourceDefinition = new GridFieldSourceDefinition('DayTrades');

    export interface CreateRenderValueResult {
        renderValue: RenderValue;
        cellAttribute: RenderValue.Attribute | undefined;
    }

    export function createField(
        id: Id,
        getDataItemCorrectnessIdEventHandler: GetDataItemCorrectnessIdEventHandler
    ): DayTradesGridField {
        switch (id) {
            case DayTradesDataItem.Field.Id.Id:
                return new IdDayTradesGridField(id, createIdGridFieldDefinition(id), getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.Price:
                return new PriceDayTradesGridField(id, createPriceGridFieldDefinition(id), getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.Quantity:
                return new QuantityDayTradesGridField(id, createQuantityGridFieldDefinition(id), getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.Time:
                return new TimeDayTradesGridField(id, createTimeGridFieldDefinition(id), getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.FlagIds:
                return new FlagIdsDayTradesGridField(id, createFlagIdsGridFieldDefinition(id), getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.TrendId:
                return new TrendIdDayTradesGridField(id, createTrendIdGridFieldDefinition(id), getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.OrderSideId:
                return new OrderSideIdDayTradesGridField(id, createOrderSideIdGridFieldDefinition(id), getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.AffectsIds:
                return new AffectsIdsDayTradesGridField(id, createAffectsIdsGridFieldDefinition(id), getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.ConditionCodes:
                return new ConditionCodesDayTradesGridField(id, createConditionCodesGridFieldDefinition(id), getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.BuyDepthOrderId:
                return new BuyDepthOrderIdDayTradesGridField(id, createBuyDepthOrderIdGridFieldDefinition(id), getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.BuyBroker:
                return new BuyBrokerDayTradesGridField(id, createBuyBrokerGridFieldDefinition(id), getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.BuyCrossRef:
                return new BuyCrossRefDayTradesGridField(id, createBuyCrossRefGridFieldDefinition(id), getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.SellDepthOrderId:
                return new SellDepthOrderIdDayTradesGridField(id, createSellDepthOrderIdGridFieldDefinition(id), getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.SellBroker:
                return new SellBrokerDayTradesGridField(id, createSellBrokerGridFieldDefinition(id), getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.SellCrossRef:
                return new SellCrossRefDayTradesGridField(id, createSellCrossRefGridFieldDefinition(id), getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.MarketId:
                return new MarketIdDayTradesGridField(id, createMarketIdGridFieldDefinition(id), getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.RelatedId:
                return new RelatedIdDayTradesGridField(id, createRelatedIdGridFieldDefinition(id), getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.Attributes:
                return new AttributesDayTradesGridField(id, createAttributesGridFieldDefinition(id), getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.RecordTypeId:
                return new RecordTypeDayTradesGridField(id, createRecordTypeIdGridFieldDefinition(id), getDataItemCorrectnessIdEventHandler);
            default:
                throw new UnreachableCaseError('DTGFCF12934883446', id);
        }
    }

    export function createDefaultGridLayoutDefinition() {
        const fieldIds: DayTradesGridField.Id[] = [
            DayTradesDataItem.Field.Id.Time,
            DayTradesDataItem.Field.Id.Price,
            DayTradesDataItem.Field.Id.Quantity,
        ];

        const count = fieldIds.length;
        const columns = new Array<GridLayoutDefinition.Column>(count);
        for (let i = 0; i < count; i++) {
            const sourceName = DayTradesGridField.sourceDefinition.name;
            const fieldId = fieldIds[i];
            const sourcelessFieldName = DayTradesDataItem.Field.idToName(fieldId);
            const fieldName = GridFieldDefinition.composeName(sourceName, sourcelessFieldName);
            const column: GridLayoutDefinition.Column = {
                fieldName,
                visible: undefined,
                autoSizableWidth: undefined,
            };
            columns[i] = column;
        }
        return new GridLayoutDefinition(columns);
    }

    export function createAllowedFields(): readonly AllowedGridField[] {
        const count = DayTradesDataItem.Field.idCount;
        const fields = new Array<AllowedGridField>(count);
        for (let id = 0; id < count; id++) {
            const field = createAllowedField(id);
            fields[id] = field;
        }
        return fields;
    }

    function createAllowedField(id: DayTradesDataItem.Field.Id): AllowedGridField {
        switch (id) {
            case DayTradesDataItem.Field.Id.Id:
                return new AllowedGridField(createIdGridFieldDefinition(id));
            case DayTradesDataItem.Field.Id.Price:
                return new AllowedGridField(createPriceGridFieldDefinition(id));
            case DayTradesDataItem.Field.Id.Quantity:
                return new AllowedGridField(createQuantityGridFieldDefinition(id));
            case DayTradesDataItem.Field.Id.Time:
                return new AllowedGridField(createTimeGridFieldDefinition(id));
            case DayTradesDataItem.Field.Id.FlagIds:
                return new AllowedGridField(createFlagIdsGridFieldDefinition(id));
            case DayTradesDataItem.Field.Id.TrendId:
                return new AllowedGridField(createTrendIdGridFieldDefinition(id));
            case DayTradesDataItem.Field.Id.OrderSideId:
                return new AllowedGridField(createOrderSideIdGridFieldDefinition(id));
            case DayTradesDataItem.Field.Id.AffectsIds:
                return new AllowedGridField(createAffectsIdsGridFieldDefinition(id));
            case DayTradesDataItem.Field.Id.ConditionCodes:
                return new AllowedGridField(createConditionCodesGridFieldDefinition(id));
            case DayTradesDataItem.Field.Id.BuyDepthOrderId:
                return new AllowedGridField(createBuyDepthOrderIdGridFieldDefinition(id));
            case DayTradesDataItem.Field.Id.BuyBroker:
                return new AllowedGridField(createBuyBrokerGridFieldDefinition(id));
            case DayTradesDataItem.Field.Id.BuyCrossRef:
                return new AllowedGridField(createBuyCrossRefGridFieldDefinition(id));
            case DayTradesDataItem.Field.Id.SellDepthOrderId:
                return new AllowedGridField(createSellDepthOrderIdGridFieldDefinition(id));
            case DayTradesDataItem.Field.Id.SellBroker:
                return new AllowedGridField(createSellBrokerGridFieldDefinition(id));
            case DayTradesDataItem.Field.Id.SellCrossRef:
                return new AllowedGridField(createSellCrossRefGridFieldDefinition(id));
            case DayTradesDataItem.Field.Id.MarketId:
                return new AllowedGridField(createMarketIdGridFieldDefinition(id));
            case DayTradesDataItem.Field.Id.RelatedId:
                return new AllowedGridField(createRelatedIdGridFieldDefinition(id));
            case DayTradesDataItem.Field.Id.Attributes:
                return new AllowedGridField(createAttributesGridFieldDefinition(id));
            case DayTradesDataItem.Field.Id.RecordTypeId:
                return new AllowedGridField(createRecordTypeIdGridFieldDefinition(id));
            default:
                throw new UnreachableCaseError('DTGFCF12934883446', id);
        }
    }

    function createIdGridFieldDefinition(id: DayTradesDataItem.Field.Id) {
        return new GridFieldDefinition(
            DayTradesGridField.sourceDefinition,
            DayTradesDataItem.Field.idToName(id),
            Strings[StringId.DayTradesGridHeading_Id],
            GridFieldHorizontalAlign.right,
        );
    }

    function createPriceGridFieldDefinition(id: DayTradesDataItem.Field.Id.Price) {
        return new GridFieldDefinition(
            sourceDefinition,
            DayTradesDataItem.Field.idToName(id),
            Strings[StringId.DayTradesGridHeading_Price],
            GridFieldHorizontalAlign.right,
        )
    }

    function createQuantityGridFieldDefinition(id: DayTradesDataItem.Field.Id.Quantity) {
        return new GridFieldDefinition(
            sourceDefinition,
            DayTradesDataItem.Field.idToName(id),
            Strings[StringId.DayTradesGridHeading_Quantity],
            GridFieldHorizontalAlign.right,
        )
    }

    function createTimeGridFieldDefinition(id: DayTradesDataItem.Field.Id.Time) {
        return new GridFieldDefinition(
            sourceDefinition,
            DayTradesDataItem.Field.idToName(id),
            Strings[StringId.DayTradesGridHeading_Time],
            GridFieldHorizontalAlign.left,
        )
    }

    function createFlagIdsGridFieldDefinition(id: DayTradesDataItem.Field.Id.FlagIds) {
        return new GridFieldDefinition(
            sourceDefinition,
            DayTradesDataItem.Field.idToName(id),
            Strings[StringId.DayTradesGridHeading_FlagIds],
            GridFieldHorizontalAlign.left,
        )
    }

    function createTrendIdGridFieldDefinition(id: DayTradesDataItem.Field.Id.TrendId) {
        return new GridFieldDefinition(
            sourceDefinition,
            DayTradesDataItem.Field.idToName(id),
            Strings[StringId.DayTradesGridHeading_TrendId],
            GridFieldHorizontalAlign.left,
        )
    }

    function createOrderSideIdGridFieldDefinition(id: DayTradesDataItem.Field.Id.OrderSideId) {
        return new GridFieldDefinition(
            sourceDefinition,
            DayTradesDataItem.Field.idToName(id),
            Strings[StringId.DayTradesGridHeading_OrderSideId],
            GridFieldHorizontalAlign.right,
        )
    }

    function createAffectsIdsGridFieldDefinition(id: DayTradesDataItem.Field.Id.AffectsIds) {
        return new GridFieldDefinition(
            sourceDefinition,
            DayTradesDataItem.Field.idToName(id),
            Strings[StringId.DayTradesGridHeading_AffectsIds],
            GridFieldHorizontalAlign.right,
        )
    }

    function createConditionCodesGridFieldDefinition(id: DayTradesDataItem.Field.Id.ConditionCodes) {
        return new GridFieldDefinition(
            sourceDefinition,
            DayTradesDataItem.Field.idToName(id),
            Strings[StringId.DayTradesGridHeading_ConditionCodes],
            GridFieldHorizontalAlign.right,
        )
    }

    function createBuyDepthOrderIdGridFieldDefinition(id: DayTradesDataItem.Field.Id.BuyDepthOrderId) {
        return new GridFieldDefinition(
            sourceDefinition,
            DayTradesDataItem.Field.idToName(id),
            Strings[StringId.DayTradesGridHeading_BuyDepthOrderId],
            GridFieldHorizontalAlign.right,
        )
    }

    function createBuyBrokerGridFieldDefinition(id: DayTradesDataItem.Field.Id.BuyBroker) {
        return new GridFieldDefinition(
            sourceDefinition,
            DayTradesDataItem.Field.idToName(id),
            Strings[StringId.DayTradesGridHeading_BuyBroker],
            GridFieldHorizontalAlign.right,
        )
    }

    function createBuyCrossRefGridFieldDefinition(id: DayTradesDataItem.Field.Id.BuyCrossRef) {
        return new GridFieldDefinition(
            sourceDefinition,
            DayTradesDataItem.Field.idToName(id),
            Strings[StringId.DayTradesGridHeading_BuyCrossRef],
            GridFieldHorizontalAlign.right,
        )
    }

    function createSellDepthOrderIdGridFieldDefinition(id: DayTradesDataItem.Field.Id.SellDepthOrderId) {
        return new GridFieldDefinition(
            sourceDefinition,
            DayTradesDataItem.Field.idToName(id),
            Strings[StringId.DayTradesGridHeading_SellDepthOrderId],
            GridFieldHorizontalAlign.right,
        )
    }

    function createSellBrokerGridFieldDefinition(id: DayTradesDataItem.Field.Id.SellBroker) {
        return new GridFieldDefinition(
            sourceDefinition,
            DayTradesDataItem.Field.idToName(id),
            Strings[StringId.DayTradesGridHeading_SellBroker],
            GridFieldHorizontalAlign.right,
        )
    }

    function createSellCrossRefGridFieldDefinition(id: DayTradesDataItem.Field.Id.SellCrossRef) {
        return new GridFieldDefinition(
            sourceDefinition,
            DayTradesDataItem.Field.idToName(id),
            Strings[StringId.DayTradesGridHeading_SellCrossRef],
            GridFieldHorizontalAlign.right,
        )
    }

    function createMarketIdGridFieldDefinition(id: DayTradesDataItem.Field.Id.MarketId) {
        return new GridFieldDefinition(
            sourceDefinition,
            DayTradesDataItem.Field.idToName(id),
            Strings[StringId.DayTradesGridHeading_MarketId],
            GridFieldHorizontalAlign.right,
        )
    }

    function createRelatedIdGridFieldDefinition(id: DayTradesDataItem.Field.Id.RelatedId) {
        return new GridFieldDefinition(
            sourceDefinition,
            DayTradesDataItem.Field.idToName(id),
            Strings[StringId.DayTradesGridHeading_RelatedId],
            GridFieldHorizontalAlign.right,
        )
    }

    function createAttributesGridFieldDefinition(id: DayTradesDataItem.Field.Id.Attributes) {
        return new GridFieldDefinition(
            sourceDefinition,
            DayTradesDataItem.Field.idToName(id),
            Strings[StringId.DayTradesGridHeading_Attributes],
            GridFieldHorizontalAlign.right,
        )
    }

    function createRecordTypeIdGridFieldDefinition(id: DayTradesDataItem.Field.Id.RecordTypeId) {
        return new GridFieldDefinition(
            sourceDefinition,
            DayTradesDataItem.Field.idToName(id),
            Strings[StringId.DayTradesGridHeading_RecordType],
            GridFieldHorizontalAlign.right,
        )
    }
}

/** @internal */
export class IdDayTradesGridField extends DayTradesGridField {
    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new IntegerRenderValue(record.tradeRecord.id),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record): ComparisonResult {
        return compareNumber(left.tradeRecord.id, right.tradeRecord.id);
    }
}

/** @internal */
export class PriceDayTradesGridField extends DayTradesGridField {
    protected createRenderValue(record: DayTradesDataItem.Record) {
        let cellAttribute: RenderValue.HigherLowerAttribute | undefined;
        switch (record.tradeRecord.trendId) {
            case MovementId.Up:
                cellAttribute = RenderValue.HigherLowerAttribute.higher;
                break;
            case MovementId.Down:
                cellAttribute = RenderValue.HigherLowerAttribute.lower;
                break;

            default:
                cellAttribute = undefined;
        }

        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new PriceRenderValue(record.tradeRecord.price),
            cellAttribute,
        };
        return result;
    }

    protected compareValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableDecimal(left.tradeRecord.price, right.tradeRecord.price, !ascending);
    }
}

/** @internal */
export class QuantityDayTradesGridField extends DayTradesGridField {
    protected createRenderValue(record: DayTradesDataItem.Record) {
        let quantity: Integer | undefined;
        if (record.relatedRecord !== undefined && record.tradeRecord.flagIds.includes(TradeFlagId.Cancel)) {
            const tradeQuantity = record.relatedRecord.tradeRecord.quantity;
            if (tradeQuantity === undefined) {
                quantity = undefined;
            } else {
                quantity = -tradeQuantity;
            }
        } else {
            quantity = record.tradeRecord.quantity;
        }

        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new IntegerRenderValue(quantity),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableInteger(left.tradeRecord.quantity, right.tradeRecord.quantity, !ascending);
    }
}

/** @internal */
export class TimeDayTradesGridField extends DayTradesGridField {
    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new SourceTzOffsetDateTimeTimeRenderValue(record.tradeRecord.time),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return SourceTzOffsetDateTime.compareUndefinable(left.tradeRecord.time, right.tradeRecord.time, !ascending);
    }
}

/** @internal */
export class FlagIdsDayTradesGridField extends DayTradesGridField {
    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new TradeFlagIdArrayRenderValue(record.tradeRecord.flagIds),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareArray(left.tradeRecord.flagIds, right.tradeRecord.flagIds);
    }
}

/** @internal */
export class TrendIdDayTradesGridField extends DayTradesGridField {
    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new TrendIdRenderValue(record.tradeRecord.trendId),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableInteger(left.tradeRecord.trendId, right.tradeRecord.trendId, !ascending);
    }
}

/** @internal */
export class OrderSideIdDayTradesGridField extends DayTradesGridField {
    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new OrderSideIdRenderValue(record.tradeRecord.orderSideId),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableInteger(left.tradeRecord.orderSideId, right.tradeRecord.orderSideId, !ascending);
    }
}

/** @internal */
export class AffectsIdsDayTradesGridField extends DayTradesGridField {
    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new TradeAffectsIdArrayRenderValue(record.tradeRecord.affectsIds),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareArray(left.tradeRecord.affectsIds, right.tradeRecord.affectsIds);
    }
}

/** @internal */
export class ConditionCodesDayTradesGridField extends DayTradesGridField {
    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new StringRenderValue(record.tradeRecord.conditionCodes),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableString(left.tradeRecord.conditionCodes, right.tradeRecord.conditionCodes, !ascending);
    }
}

/** @internal */
export class BuyDepthOrderIdDayTradesGridField extends DayTradesGridField {
    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new StringRenderValue(record.tradeRecord.buyDepthOrderId),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableString(left.tradeRecord.buyDepthOrderId, right.tradeRecord.buyDepthOrderId, !ascending);
    }
}

/** @internal */
export class BuyBrokerDayTradesGridField extends DayTradesGridField {
    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new StringRenderValue(record.tradeRecord.buyBroker),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableString(left.tradeRecord.buyBroker, right.tradeRecord.buyBroker, !ascending);
    }
}

/** @internal */
export class BuyCrossRefDayTradesGridField extends DayTradesGridField {
    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new StringRenderValue(record.tradeRecord.buyCrossRef),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableString(left.tradeRecord.buyCrossRef, right.tradeRecord.buyCrossRef, !ascending);
    }
}

/** @internal */
export class SellDepthOrderIdDayTradesGridField extends DayTradesGridField {
    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new StringRenderValue(record.tradeRecord.sellDepthOrderId),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableString(left.tradeRecord.sellDepthOrderId, right.tradeRecord.sellDepthOrderId, !ascending);
    }
}

/** @internal */
export class SellBrokerDayTradesGridField extends DayTradesGridField {
    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new StringRenderValue(record.tradeRecord.sellBroker),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableString(left.tradeRecord.sellBroker, right.tradeRecord.sellBroker, !ascending);
    }
}

/** @internal */
export class SellCrossRefDayTradesGridField extends DayTradesGridField {
    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new StringRenderValue(record.tradeRecord.sellCrossRef),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableString(left.tradeRecord.sellCrossRef, right.tradeRecord.sellCrossRef, !ascending);
    }
}

/** @internal */
export class MarketIdDayTradesGridField extends DayTradesGridField {
    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new MarketIdRenderValue(record.tradeRecord.marketId),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableEnum(left.tradeRecord.marketId, right.tradeRecord.marketId, !ascending);
    }
}

/** @internal */
export class RelatedIdDayTradesGridField extends DayTradesGridField {
    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new IntegerRenderValue(record.tradeRecord.relatedId),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableInteger(left.tradeRecord.relatedId, right.tradeRecord.relatedId, !ascending);
    }
}

/** @internal */
export class AttributesDayTradesGridField extends DayTradesGridField {
    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new StringArrayRenderValue(record.tradeRecord.attributes),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record) {
        return compareArray(left.tradeRecord.attributes, right.tradeRecord.attributes);
    }
}

/** @internal */
export class RecordTypeDayTradesGridField extends DayTradesGridField {
    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new DayTradesDataItemRecordTypeIdRenderValue(record.typeId),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record) {
        return DayTradesDataItem.Record.Type.sortCompareId(left.typeId, right.typeId);
    }
}
