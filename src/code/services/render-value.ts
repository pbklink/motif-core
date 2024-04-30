/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevTextFormattableValue } from '@xilytix/revgrid';
import {
    ActiveFaultedStatusId,
    DayTradesDataItem,
    HigherLowerId,
    IvemId,
    LitIvemId,
    MarketId,
    MovementId, OrderExtendedSideId, OrderSideId, OrderStatus,
    RoutedIvemId,
    TradeAffectsId,
    TradeFlagId
} from "../adi/internal-api";
import {
    CorrectnessId,
    Decimal,
    Integer,
    PriceOrRemainder,
    SourceTzOffsetDate,
    SourceTzOffsetDateTime,
    newUndefinableDecimal
} from '../sys/internal-api';
import { ColorSettings } from './settings/internal-api';

export abstract class TextFormattableValue implements RevTextFormattableValue<TextFormattableValue.TypeId, TextFormattableValue.Attribute.TypeId> {
    formattedText: string | undefined;

    private _attributes: TextFormattableValue.Attribute[] = [];

    constructor(readonly typeId: TextFormattableValue.TypeId) { }

    get attributes(): readonly TextFormattableValue.Attribute[] { return this._attributes; }

    addAttribute(value: TextFormattableValue.Attribute) { this._attributes.push(value); }
    setAttributes(value: TextFormattableValue.Attribute[]) { this._attributes = value; }

    protected assign(other: TextFormattableValue) {
        this._attributes = other._attributes;
        this.formattedText = other.formattedText;
    }

    abstract isUndefined(): boolean;
}

export namespace TextFormattableValue {
    export const enum TypeId {
        // eslint-disable-next-line id-blacklist
        String,
        // eslint-disable-next-line id-blacklist
        Number,
        Percentage,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        Integer,
        BigInt,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        Decimal,
        Price,
        Date,
        DateTime,
        Time,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        SourceTzOffsetDateTime,
        SourceTzOffsetDateTimeDate,
        SourceTzOffsetDateTimeTime,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        SourceTzOffsetDate,
        Color,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        IvemId,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        LitIvemId,
        LitIvemIdArray,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        RoutedIvemId,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        PriceOrRemainder,
        // Boolean
        TrueFalse,
        Enabled,
        Readonly,
        Valid,
        Faulted,
        Modified,
        IsIndex,
        Visible,
        Writable,
        Undisclosed,
        IsReadable,
        PhysicalDelivery,
        Matched,
        // Enum
        // eslint-disable-next-line @typescript-eslint/no-shadow
        ActiveFaultedStatusId,
        TradingStateReasonId,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        MarketId,
        TrendId,
        ColorSettingsItemStateId,
        TradeAffectsIdArray,
        ExchangeId,
        CallOrPutId,
        ExerciseTypeId,
        RankedLitIvemIdListDirectoryItemTypeId,
        MarketBoardId,
        FeedStatusId,
        FeedClassId,
        CurrencyId,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        OrderExtendedSideId,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        OrderSideId,
        EquityOrderTypeId,
        TimeInForceId,
        OrderShortSellTypeId,
        OrderPriceUnitTypeId,
        OrderRouteAlgorithmId,
        OrderTriggerTypeId,
        GridOrderTriggerTypeId,
        TrailingStopLossOrderConditionTypeId,
        DataEnvironmentId,
        IvemClassId,
        DepthDirectionId,
        MarketClassificationIdMyxLitIvemAttribute,
        DeliveryBasisIdMyxLitIvemAttribute,
        DayTradesDataItemRecordTypeId,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        ScanCriteriaTypeId,
        ScanTargetTypeId,
        ScanFieldBooleanOperationId,
        NotificationChannelSourceSettingsUrgencyId,
        NotificationDistributionMethodId,

        // Array
        StringArray,
        IntegerArray,
        MarketBoardIdArray,
        PublisherSubscriptionDataTypeIdArray,
        TradeFlagIdArray,
        TradingStateAllowIdArray,
        MarketIdArray,
        OrderStatusAllowIdArray,
        OrderStatusReasonIdArray,

        ShortSellTypeIdArrayMyxLitIvemAttribute,

        // Composite
        PriceAndHasUndisclosed,
        PriceOrRemainderAndHasUndisclosed,
        CountAndXrefs,
    }

    export interface Attribute {
        readonly typeId: Attribute.TypeId;
    }

    export namespace Attribute {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export const enum TypeId {
            Correctness,
            HigherLower,
            BackgroundColor,
            // eslint-disable-next-line @typescript-eslint/no-shadow
            DepthRecord,
            DepthCountXRefField,
            DepthRecordInAuction,
            GreyedOut,
            Cancelled,
            Canceller,
            OwnOrder,
            Advert,
        }
    }

    export interface CorrectnessAttribute extends Attribute {
        readonly typeId: Attribute.TypeId.Correctness;
        correctnessId: CorrectnessId;
    }

    export namespace DataCorrectnessAttribute {
        export const suspect: CorrectnessAttribute = {
            typeId: Attribute.TypeId.Correctness,
            correctnessId: CorrectnessId.Suspect
        } as const;

        export const error: CorrectnessAttribute = {
            typeId: Attribute.TypeId.Correctness,
            correctnessId: CorrectnessId.Error
        } as const;
    }

    export interface HigherLowerAttribute extends Attribute {
        readonly typeId: Attribute.TypeId.HigherLower;
        higherLowerId: HigherLowerId;
    }

    export namespace HigherLowerAttribute {
        export const higher: HigherLowerAttribute = {
            typeId: Attribute.TypeId.HigherLower,
            higherLowerId: HigherLowerId.Higher
        } as const;

        export const lower: HigherLowerAttribute = {
            typeId: Attribute.TypeId.HigherLower,
            higherLowerId: HigherLowerId.Lower
        } as const;
    }

    export const backgroundColorAttribute: Attribute = {
        typeId: Attribute.TypeId.BackgroundColor
    } as const;

    // export interface DepthRecordAttribute extends Attribute {
    //     readonly id: Attribute.TypeId.DepthRecord;
    //     orderSideId: OrderSideId;
    //     depthRecordTypeId: DepthRecord.TypeId;
    //     ownOrder: boolean;
    // }

    export interface DepthCountXRefFieldAttribute extends Attribute {
        readonly typeId: Attribute.TypeId.DepthCountXRefField;
        isCountAndXrefs: boolean;
    }

    export namespace DepthCountXRefFieldAttribute {
        export const countAndXrefs: DepthCountXRefFieldAttribute = {
            typeId: Attribute.TypeId.DepthCountXRefField,
            isCountAndXrefs: true,
        } as const;

        export const xref: DepthCountXRefFieldAttribute = {
            typeId: Attribute.TypeId.DepthCountXRefField,
            isCountAndXrefs: false,
        } as const;
    }

    export interface DepthRecordInAuctionAttribute extends Attribute {
        readonly typeId: Attribute.TypeId.DepthRecordInAuction;
        partialAuctionProportion: number | undefined;
    }

    export interface GreyedOutAttribute extends Attribute {
        readonly typeId: Attribute.TypeId.GreyedOut;
    }

    export const greyedOutAttribute: GreyedOutAttribute = {
        typeId: Attribute.TypeId.GreyedOut
    } as const;

    export interface CancelledAttribute extends Attribute {
        readonly typeId: Attribute.TypeId.Cancelled;
    }

    export const cancelledAttribute: CancelledAttribute = {
        typeId: Attribute.TypeId.Cancelled
    } as const;

    export interface CancellerAttribute extends Attribute {
        readonly typeId: Attribute.TypeId.Canceller;
    }

    export const cancellerAttribute: CancellerAttribute = {
        typeId: Attribute.TypeId.Canceller
    } as const;

    export interface OwnOrderAttribute extends Attribute {
        readonly typeId: Attribute.TypeId.OwnOrder;
    }

    export const ownOrderAttribute: OwnOrderAttribute = {
        typeId: Attribute.TypeId.OwnOrder
    } as const;

    export interface AdvertAttribute extends Attribute {
        readonly typeId: Attribute.TypeId.Advert;
    }

    export const advertAttribute: AdvertAttribute = {
        typeId: Attribute.TypeId.Advert
    } as const;
}

export abstract class GenericRenderValue<T> extends TextFormattableValue {
    private readonly _data: T;
    constructor(data: T | undefined, typeId: TextFormattableValue.TypeId) {
        super(typeId);
        if (data !== undefined) {
            this._data = data;
        }
    }

    get definedData() { return this._data; }

    isUndefined() {
        return this._data === undefined;
    }

    // get data() { return this._data; }
    // set data(value: T | undefined) {
    //     this._data = value;
    //     if (value !== undefined) {
    //         this._definedData = value;
    //     }
    // }
}

export class StringRenderValue extends GenericRenderValue<string> {
    constructor(data: string | undefined) {
        super(data, TextFormattableValue.TypeId.String);
    }
}

export class NumberRenderValue extends GenericRenderValue<number> {
    constructor(data: number | undefined) {
        super(data, TextFormattableValue.TypeId.Number);
    }
}

export class PercentageRenderValue extends GenericRenderValue<number> {
    constructor(data: number | undefined) {
        super(data, TextFormattableValue.TypeId.Percentage);
    }
}

export class IntegerRenderValue extends GenericRenderValue<Integer> {
    constructor(data: Integer | undefined) {
        super(data, TextFormattableValue.TypeId.Integer);
    }
}

export class BigIntRenderValue extends GenericRenderValue<bigint> {
    constructor(data: bigint | undefined) {
        super(data, TextFormattableValue.TypeId.Number);
    }
}

export class DateRenderValue extends GenericRenderValue<Date> {
    constructor(data: Date | undefined) {
        super(data, TextFormattableValue.TypeId.Date);
    }
}

export class DateTimeRenderValue extends GenericRenderValue<Date> {
    constructor(data: Date | undefined) {
        super(data, TextFormattableValue.TypeId.DateTime);
    }
}

export class TimeRenderValue extends GenericRenderValue<Date> {
    constructor(data: Date | undefined) {
        super(data, TextFormattableValue.TypeId.Time);
    }
}

export class SourceTzOffsetDateTimeRenderValue extends GenericRenderValue<SourceTzOffsetDateTime> {
    constructor(data: SourceTzOffsetDateTime | undefined) {
        super(data, TextFormattableValue.TypeId.SourceTzOffsetDateTime);
    }
}

export class SourceTzOffsetDateTimeDateRenderValue extends GenericRenderValue<SourceTzOffsetDateTime> {
    constructor(data: SourceTzOffsetDateTime | undefined) {
        super(data, TextFormattableValue.TypeId.SourceTzOffsetDateTimeDate);
    }
}

export class SourceTzOffsetDateTimeTimeRenderValue extends GenericRenderValue<SourceTzOffsetDateTime> {
    constructor(data: SourceTzOffsetDateTime | undefined) {
        super(data, TextFormattableValue.TypeId.SourceTzOffsetDateTimeTime);
    }
}

export class SourceTzOffsetDateRenderValue extends GenericRenderValue<SourceTzOffsetDate> {
    constructor(data: SourceTzOffsetDate | undefined) {
        super(data, TextFormattableValue.TypeId.SourceTzOffsetDate);
    }
}

export class DecimalRenderValue extends GenericRenderValue<Decimal> {
    constructor(data: Decimal | undefined) {
        super(newUndefinableDecimal(data), TextFormattableValue.TypeId.Decimal);
    }
}

export class PriceRenderValue extends GenericRenderValue<Decimal> {
    constructor(data: Decimal | undefined) {
        super(data === undefined ? undefined : new PriceRenderValue.decimalConstructor(data), TextFormattableValue.TypeId.Price);
    }
}

export namespace PriceRenderValue {
    export const decimalConstructor = Decimal.clone({
        precision: 20,
        rounding: Decimal.ROUND_HALF_UP,
        toExpNeg: -15,
        toExpPos: 30,
    });
}

export class PriceOrRemainderRenderValue extends GenericRenderValue<PriceOrRemainder> {
    constructor(data: PriceOrRemainder | undefined) {
        super(data === undefined ? undefined :
            data === null ? null : new PriceRenderValue.decimalConstructor(data), TextFormattableValue.TypeId.PriceOrRemainder);
    }
}

export class ColorRenderValue extends GenericRenderValue<string> {
    constructor(data: string | undefined) {
        super(data, TextFormattableValue.TypeId.Color);
        this.addAttribute(TextFormattableValue.backgroundColorAttribute);
    }
}

export class StringArrayRenderValue extends GenericRenderValue<readonly string[]> {
    constructor(data: readonly string[] | undefined) {
        super(data, TextFormattableValue.TypeId.StringArray);
    }
}

export class IvemIdRenderValue extends GenericRenderValue<IvemId> {
    constructor(data: IvemId | undefined) {
        super(data, TextFormattableValue.TypeId.IvemId);
    }
}

export class LitIvemIdRenderValue extends GenericRenderValue<LitIvemId> {
    constructor(data: LitIvemId | undefined) {
        super(data, TextFormattableValue.TypeId.LitIvemId);
    }
}

export class LitIvemIdArrayRenderValue extends GenericRenderValue<readonly LitIvemId[]> {
    constructor(data: readonly LitIvemId[] | undefined) {
        super(data, TextFormattableValue.TypeId.LitIvemIdArray);
    }
}

export class RoutedIvemIdRenderValue extends GenericRenderValue<RoutedIvemId> {
    constructor(data: RoutedIvemId | undefined) {
        super(data, TextFormattableValue.TypeId.RoutedIvemId);
    }
}

export class BooleanRenderValue extends GenericRenderValue<boolean> {
}

export class TrueFalseRenderValue extends BooleanRenderValue {
    constructor(data: boolean | undefined) {
        super(data, TextFormattableValue.TypeId.TrueFalse);
    }
}

export class EnabledRenderValue extends BooleanRenderValue {
    constructor(data: boolean | undefined) {
        super(data, TextFormattableValue.TypeId.Enabled);
    }
}

export class ReadonlyRenderValue extends BooleanRenderValue {
    constructor(data: boolean | undefined) {
        super(data, TextFormattableValue.TypeId.Readonly);
    }
}

export class ValidRenderValue extends BooleanRenderValue {
    constructor(data: boolean | undefined) {
        super(data, TextFormattableValue.TypeId.Valid);
    }
}

export class ModifiedRenderValue extends BooleanRenderValue {
    constructor(data: boolean | undefined) {
        super(data, TextFormattableValue.TypeId.Modified);
    }
}

export class UndisclosedRenderValue extends BooleanRenderValue {
    constructor(data: boolean | undefined) {
        super(data, TextFormattableValue.TypeId.Undisclosed);
    }
}

export class IsReadableRenderValue extends BooleanRenderValue {
    constructor(data: boolean | undefined) {
        super(data, TextFormattableValue.TypeId.IsReadable);
    }
}

export class MatchedRenderValue extends BooleanRenderValue {
    constructor(data: boolean | undefined) {
        super(data, TextFormattableValue.TypeId.Matched);
    }
}

export class EnumRenderValue extends GenericRenderValue<Integer> {
}

export class ActiveFaultedStatusIdRenderValue extends EnumRenderValue {
    constructor(data: ActiveFaultedStatusId | undefined) {
        super(data, TextFormattableValue.TypeId.ActiveFaultedStatusId);
    }
}

export class MarketIdRenderValue extends EnumRenderValue {
    constructor(data: MarketId | undefined) {
        super(data, TextFormattableValue.TypeId.MarketId);
    }
}

export class OrderSideIdRenderValue extends EnumRenderValue {
    constructor(data: OrderSideId | undefined) {
        super(data, TextFormattableValue.TypeId.OrderSideId);
    }
}

export class OrderExtendedSideIdRenderValue extends EnumRenderValue {
    constructor(data: OrderExtendedSideId | undefined) {
        super(data, TextFormattableValue.TypeId.OrderExtendedSideId);
    }
}

export class TrendIdRenderValue extends EnumRenderValue {
    constructor(data: MovementId | undefined) {
        super(data, TextFormattableValue.TypeId.TrendId);
    }
}

export class ColorSettingsItemStateIdRenderValue extends EnumRenderValue {
    constructor(data: ColorSettings.ItemStateId | undefined) {
        super(data, TextFormattableValue.TypeId.ColorSettingsItemStateId);
    }
}

export class DayTradesDataItemRecordTypeIdRenderValue extends EnumRenderValue {
    constructor(data: DayTradesDataItem.Record.TypeId | undefined) {
        super(data, TextFormattableValue.TypeId.DayTradesDataItemRecordTypeId);
    }
}

export class IntegerArrayRenderValue extends GenericRenderValue<readonly Integer[]> {
}

export class TradeAffectsIdArrayRenderValue extends IntegerArrayRenderValue {
    constructor(data: readonly TradeAffectsId[] | undefined) {
        super(data, TextFormattableValue.TypeId.TradeAffectsIdArray);
    }
}

export class TradeFlagIdArrayRenderValue extends IntegerArrayRenderValue {
    constructor(data: readonly TradeFlagId[] | undefined) {
        super(data, TextFormattableValue.TypeId.TradeFlagIdArray);
    }
}

export class MarketIdArrayRenderValue extends IntegerArrayRenderValue {
    constructor(data: readonly MarketId[] | undefined) {
        super(data, TextFormattableValue.TypeId.MarketIdArray);
    }
}

export class OrderStatusAllowIdArrayRenderValue extends IntegerArrayRenderValue {
    constructor(data: readonly OrderStatus.AllowId[] | undefined) {
        super(data, TextFormattableValue.TypeId.OrderStatusAllowIdArray);
    }
}

export class OrderStatusReasonIdArrayRenderValue extends IntegerArrayRenderValue {
    constructor(data: readonly OrderStatus.ReasonId[] | undefined) {
        super(data, TextFormattableValue.TypeId.OrderStatusReasonIdArray);
    }
}

export class PriceAndHasUndisclosedRenderValue extends GenericRenderValue<PriceAndHasUndisclosedRenderValue.DataType> {
    constructor(data: PriceAndHasUndisclosedRenderValue.DataType | undefined) {
        super(data, TextFormattableValue.TypeId.PriceAndHasUndisclosed);
    }
}

export namespace PriceAndHasUndisclosedRenderValue {
    export interface DataType {
        price: Decimal;
        hasUndisclosed: boolean;
    }
}

export class PriceOrRemainderAndHasUndisclosedRenderValue extends
    GenericRenderValue<PriceOrRemainderAndHasUndisclosedRenderValue.DataType> {
    constructor(data: PriceOrRemainderAndHasUndisclosedRenderValue.DataType | undefined) {
        super(data, TextFormattableValue.TypeId.PriceOrRemainderAndHasUndisclosed);
    }
}

export namespace PriceOrRemainderAndHasUndisclosedRenderValue {
    export interface DataType {
        price: PriceOrRemainder;
        hasUndisclosed: boolean;
    }
}

export class CountAndXrefsRenderValue extends GenericRenderValue<CountAndXrefsRenderValue.DataType> {
    constructor(data: CountAndXrefsRenderValue.DataType | undefined) {
        super(data, TextFormattableValue.TypeId.CountAndXrefs);
    }
}

export namespace CountAndXrefsRenderValue {
    export interface DataType {
        count: Integer;
        xrefs: string[];
    }
}
