/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from 'decimal.js-light';
import { IvemId, LitIvemId } from '../../../adi/adi-internal-api';
import {
    BooleanRenderValue,
    DateRenderValue,
    DateTimeRenderValue,
    DecimalRenderValue,
    EnumRenderValue,
    IntegerArrayRenderValue,
    IntegerRenderValue,
    IvemIdRenderValue,
    LitIvemIdArrayRenderValue,
    LitIvemIdRenderValue,
    NumberRenderValue,
    PercentageRenderValue,
    PriceRenderValue,
    RenderValue,
    SourceTzOffsetDateRenderValue,
    SourceTzOffsetDateTimeDateRenderValue,
    SourceTzOffsetDateTimeRenderValue,
    StringArrayRenderValue,
    StringRenderValue
} from '../../../services/services-internal-api';
import {
    CorrectnessId,
    Integer,
    SourceTzOffsetDate,
    SourceTzOffsetDateTime,
    newUndefinableDate,
    newUndefinableDecimal
} from '../../../sys/sys-internal-api';

export abstract class TableValue {
    private _renderValue: RenderValue | undefined;
    private _renderAttributes: RenderValue.Attribute[] = [];

    get renderValue() {
        if (this._renderValue === undefined) {
            this._renderValue = this.createRenderValue();
            this._renderValue.setAttributes(this._renderAttributes);
        }
        return this._renderValue;
    }

    addRenderAttribute(value: RenderValue.Attribute) {
        this._renderAttributes.push(value);
    }

    clearRendering() {
        this._renderValue = undefined;
    }

    abstract isUndefined(): boolean;

    protected abstract createRenderValue(): RenderValue;
}

export namespace TableValue {
    export type Constructor = new() => TableValue;
}

export abstract class GenericTableValue<T> extends TableValue {
    private _data: T | undefined;
    private _definedData: T;

    get definedData() { return this._definedData; }

    get data() { return this._data; }
    set data(value: T | undefined) {
        this._data = value;
        if (value !== undefined) {
            this._definedData = value;
        }
    }

    isUndefined() {
        return this._data === undefined;
    }

    clear() {
        this._data = undefined;
    }
}

export class StringTableValue extends GenericTableValue<string> {
    protected createRenderValue() {
        return new StringRenderValue(this.data);
    }
}
export abstract class BaseNumberTableValue extends GenericTableValue<number> {
}
export class NumberTableValue extends BaseNumberTableValue {
    protected createRenderValue() {
        return new NumberRenderValue(this.data);
    }
}
export class PercentageTableValue extends BaseNumberTableValue {
    protected createRenderValue() {
        return new PercentageRenderValue(this.data);
    }
}
export class IntegerTableValue extends GenericTableValue<Integer> {
    protected createRenderValue() {
        return new IntegerRenderValue(this.data);
    }
}
export class DateTableValue extends GenericTableValue<Date> {
    override get data() { return super.data; }

    override set data(value: Date | undefined) {
        super.data = newUndefinableDate(value);
    }

    protected createRenderValue() {
        return new DateRenderValue(this.data);
    }
}
export class IvemIdTableValue extends GenericTableValue<IvemId> {
    override get data() { return super.data; }
    override set data(value: IvemId | undefined) {
        super.data = value?.createCopy();
    }

    protected createRenderValue() {
        return new IvemIdRenderValue(this.data);
    }
}
export class LitIvemIdTableValue extends GenericTableValue<LitIvemId> {
    override get data() { return super.data; }
    override set data(value: LitIvemId | undefined) {
        super.data = value?.createCopy();
    }

    protected createRenderValue() {
        return new LitIvemIdRenderValue(this.data);
    }
}

export abstract class BaseDecimalTableValue extends GenericTableValue<Decimal> {
    // protected createRenderValue() {
    //     return new DecimalRenderValue(this.data);
    // }

    override get data() { return super.data; }

    override set data(value: Decimal | undefined) {
        super.data = newUndefinableDecimal(value);
    }
}
export class DecimalTableValue extends BaseDecimalTableValue {
    protected createRenderValue() {
        return new DecimalRenderValue(this.data);
    }
}
export class PriceTableValue extends BaseDecimalTableValue {
    protected createRenderValue() {
        return new PriceRenderValue(this.data);
    }
}

export abstract class BooleanTableValue extends GenericTableValue<boolean> {
    protected renderValueTypeId: RenderValue.TypeId;

    protected createRenderValue() {
        return new BooleanRenderValue(this.data, this.renderValueTypeId);
    }
}
export class IsIndexTableValue extends BooleanTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.IsIndex;
    }
}
export class VisibleTableValue extends BooleanTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.Visible;
    }
}
export class EnabledTableValue extends BooleanTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.Enabled;
    }
}
export class ValidTableValue extends BooleanTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.Valid;
    }
}
export class FaultedTableValue extends BooleanTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.Faulted;
    }
}

export abstract class EnumTableValue extends GenericTableValue<Integer> {
    protected renderValueTypeId: RenderValue.TypeId;

    protected createRenderValue() {
        return new EnumRenderValue(this.data, this.renderValueTypeId);
    }
}
export class ActiveFaultedStatusIdTableValue extends EnumTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.ActiveFaultedStatusId;
    }
}
export class MarketIdTableValue extends EnumTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.MarketId;
    }
}
export class DataEnvironmentIdTableValue extends EnumTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.DataEnvironmentId;
    }
}
export class ExerciseTypeIdTableValue extends EnumTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.ExerciseTypeId;
    }
}
export class ScanFieldBooleanOperationIdTableValue extends EnumTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.ScanFieldBooleanOperationId;
    }
}
export class NotificationChannelSourceSettingsUrgencyIdTableValue extends EnumTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.NotificationChannelSourceSettingsUrgencyId;
    }
}
export class NotificationDistributionMethodIdTableValue extends EnumTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.NotificationDistributionMethodId;
    }
}

export abstract class BaseIntegerArrayTableValue extends GenericTableValue<Integer[]> {
    protected renderValueTypeId: RenderValue.TypeId;

    protected createRenderValue() {
        return new IntegerArrayRenderValue(this.data, this.renderValueTypeId);
    }
}

export class IntegerArrayTableValue extends BaseIntegerArrayTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.IntegerArray;
    }
}

export abstract class CorrectnessTableValue extends TableValue {
    _correctnessId: CorrectnessId;

    get dataCorrectnessId() { return this._correctnessId; }
    set dataCorrectnessId(value: CorrectnessId) {
        this._correctnessId = value;
        switch (value) {
            case CorrectnessId.Suspect:
                this.addRenderAttribute(RenderValue.DataCorrectnessAttribute.suspect);
                break;
            case CorrectnessId.Error:
                this.addRenderAttribute(RenderValue.DataCorrectnessAttribute.error);
                break;
        }
    }
}

export namespace CorrectnessTableValue {

    export type Constructor = new() => CorrectnessTableValue;
}

export abstract class GenericCorrectnessTableValue<T> extends CorrectnessTableValue {
    private _data: T | undefined;
    private _definedData: T;

    get definedData() { return this._definedData; }

    get data() { return this._data; }
    set data(value: T | undefined) {
        this._data = value;
        if (value !== undefined) {
            this._definedData = value;
        }
    }

    isUndefined() {
        return this._data === undefined;
    }

    clear() {
        this._data = undefined;
    }
}

export class StringCorrectnessTableValue extends GenericCorrectnessTableValue<string> {
    protected createRenderValue() {
        return new StringRenderValue(this.data);
    }
}
export abstract class BaseNumberCorrectnessTableValue extends GenericCorrectnessTableValue<number> {
}
export class NumberCorrectnessTableValue extends BaseNumberCorrectnessTableValue {
    protected createRenderValue() {
        return new NumberRenderValue(this.data);
    }
}
export class PercentageCorrectnessTableValue extends BaseNumberCorrectnessTableValue {
    protected createRenderValue() {
        return new PercentageRenderValue(this.data);
    }
}
export class IntegerCorrectnessTableValue extends GenericCorrectnessTableValue<Integer> {
    protected createRenderValue() {
        return new IntegerRenderValue(this.data);
    }
}

export abstract class BaseDateCorrectnessTableValue extends GenericCorrectnessTableValue<Date> {
    override get data() { return super.data; }
    override set data(value: Date | undefined) {
        super.data = newUndefinableDate(value);
    }
}
export class DateCorrectnessTableValue extends BaseDateCorrectnessTableValue {
    protected createRenderValue() {
        return new DateRenderValue(this.data);
    }
}

export class DateTimeCorrectnessTableValue extends BaseDateCorrectnessTableValue {
    protected createRenderValue() {
        return new DateTimeRenderValue(this.data);
    }
}

export abstract class BaseSourceTzOffsetDateTimeCorrectnessTableValue
        extends GenericCorrectnessTableValue<SourceTzOffsetDateTime> {

    override get data() { return super.data; }
    override set data(value: SourceTzOffsetDateTime | undefined) {
        super.data = SourceTzOffsetDateTime.newUndefinable(value);
    }
}
export class SourceTzOffsetDateTimeCorrectnessTableValue extends BaseSourceTzOffsetDateTimeCorrectnessTableValue {
    protected createRenderValue() {
        return new SourceTzOffsetDateTimeRenderValue(this.data);
    }
}
export class SourceTzOffsetDateTimeDateCorrectnessTableValue extends BaseSourceTzOffsetDateTimeCorrectnessTableValue {
    protected createRenderValue() {
        return new SourceTzOffsetDateTimeDateRenderValue(this.data);
    }
}
export class SourceTzOffsetDateCorrectnessTableValue extends GenericCorrectnessTableValue<SourceTzOffsetDate> {
    override get data() { return super.data; }
    override set data(value: SourceTzOffsetDate | undefined) {
        super.data = SourceTzOffsetDate.newUndefinable(value);
    }

    protected createRenderValue() {
        return new SourceTzOffsetDateRenderValue(this.data);
    }
}
export class IvemIdCorrectnessTableValue extends GenericCorrectnessTableValue<IvemId> {
    override get data() { return super.data; }
    override set data(value: IvemId | undefined) {
        super.data = value?.createCopy();
    }

    protected createRenderValue() {
        return new IvemIdRenderValue(this.data);
    }
}
export class LitIvemIdCorrectnessTableValue extends GenericCorrectnessTableValue<LitIvemId> {
    override get data() { return super.data; }
    override set data(value: LitIvemId | undefined) {
        super.data = value?.createCopy();
    }

    protected createRenderValue() {
        return new LitIvemIdRenderValue(this.data);
    }
}

export abstract class BooleanCorrectnessTableValue extends GenericCorrectnessTableValue<boolean> {
    protected renderValueTypeId: RenderValue.TypeId;

    protected createRenderValue() {
        return new BooleanRenderValue(this.data, this.renderValueTypeId);
    }
}
export class EnabledCorrectnessTableValue extends BooleanCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.Enabled;
    }
}
export class ModifiedCorrectnessTableValue extends BooleanCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.Modified;
    }
}
export class IsIndexCorrectnessTableValue extends BooleanCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.IsIndex;
    }
}
export class UndisclosedCorrectnessTableValue extends BooleanCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.Undisclosed;
    }
}
export class PhysicalDeliveryCorrectnessTableValue extends BooleanCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.PhysicalDelivery;
    }
}
export class WritableCorrectnessTableValue extends BooleanCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.Writable;
    }
}
export class ReadonlyCorrectnessTableValue extends BooleanCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.Readonly;
    }
}



export abstract class BaseDecimalCorrectnessTableValue extends GenericCorrectnessTableValue<Decimal> {
    // protected createRenderValue() {
    //     return new DecimalRenderValue(this.data);
    // }

    override get data() { return super.data; }

    override set data(value: Decimal | undefined) {
        super.data = newUndefinableDecimal(value);
    }
}
export class DecimalCorrectnessTableValue extends BaseDecimalCorrectnessTableValue {
    protected createRenderValue() {
        return new DecimalRenderValue(this.data);
    }
}
export class PriceCorrectnessTableValue extends BaseDecimalCorrectnessTableValue {
    protected createRenderValue() {
        return new PriceRenderValue(this.data);
    }
}

export abstract class EnumCorrectnessTableValue extends GenericCorrectnessTableValue<Integer> {
    protected renderValueTypeId: RenderValue.TypeId;

    protected createRenderValue() {
        return new EnumRenderValue(this.data, this.renderValueTypeId);
    }
}
export class TradingStateReasonIdCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.TradingStateReasonId;
    }
}
export class MarketIdCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.MarketId;
    }
}
export class ExchangeIdCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.ExchangeId;
    }
}
export class CallOrPutCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.CallOrPutId;
    }
}
export class MarketBoardIdCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.MarketBoardId;
    }
}
export class CurrencyIdCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.CurrencyId;
    }
}
export class OrderSideIdCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.OrderSideId;
    }
}
export class OrderExtendedSideIdCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.OrderExtendedSideId;
    }
}
export class EquityOrderTypeIdCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.EquityOrderTypeId;
    }
}
export class TimeInForceIdCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.TimeInForceId;
    }
}
export class OrderShortSellTypeIdCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.OrderShortSellTypeId;
    }
}
export class OrderPriceUnitTypeIdCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.OrderPriceUnitTypeId;
    }
}
export class OrderRouteAlgorithmIdCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.OrderRouteAlgorithmId;
    }
}
export class OrderTriggerTypeIdCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.OrderTriggerTypeId;
    }
}
export class GridOrderTriggerTypeIdCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.GridOrderTriggerTypeId;
    }
}
export class TrailingStopLossOrderConditionTypeIdCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.TrailingStopLossOrderConditionTypeId;
    }
}
export class DataEnvironmentIdCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.DataEnvironmentId;
    }
}
export class FeedStatusIdCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.FeedStatusId;
    }
}
export class FeedClassIdCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.FeedClassId;
    }
}
export class IvemClassIdCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.IvemClassId;
    }
}
export class DepthDirectionIdCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.DepthDirectionId;
    }
}
export class ExerciseTypeIdCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.ExerciseTypeId;
    }
}
export class CallOrPutIdCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.CallOrPutId;
    }
}
export class MarketClassificationIdMyxLitIvemAttributeCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.MarketClassificationIdMyxLitIvemAttribute;
    }
}
export class DeliveryBasisIdMyxLitIvemAttributeCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.DeliveryBasisIdMyxLitIvemAttribute;
    }
}
export class ScanTargetTypeIdCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.ScanTargetTypeId;
    }
}
export class ActiveFaultedStatusIdCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.ActiveFaultedStatusId;
    }
}
export class RankedLitIvemIdListDirectoryItemTypeIdCorrectnessTableValue extends EnumCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.RankedLitIvemIdListDirectoryItemTypeId;
    }
}

export class StringArrayCorrectnessTableValue extends GenericCorrectnessTableValue<readonly string[]> {
    protected createRenderValue() {
        return new StringArrayRenderValue(this.data);
    }
}

export abstract class BaseIntegerArrayCorrectnessTableValue extends GenericCorrectnessTableValue<readonly Integer[]> {
    protected renderValueTypeId: RenderValue.TypeId;

    protected createRenderValue() {
        return new IntegerArrayRenderValue(this.data, this.renderValueTypeId);
    }
}

export class IntegerArrayCorrectnessTableValue extends BaseIntegerArrayCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.IntegerArray;
    }
}

export class TradingStateAllowIdArrayCorrectnessTableValue extends BaseIntegerArrayCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.TradingStateAllowIdArray;
    }
}

export class MarketIdArrayCorrectnessTableValue extends BaseIntegerArrayCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.MarketIdArray;
    }
}

export class OrderStatusAllowIdArrayCorrectnessTableValue extends BaseIntegerArrayCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.OrderStatusAllowIdArray;
    }
}

export class OrderStatusReasonIdArrayCorrectnessTableValue extends BaseIntegerArrayCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.OrderStatusReasonIdArray;
    }
}

export class MarketBoardIdArrayCorrectnessTableValue extends BaseIntegerArrayCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.MarketBoardIdArray;
    }
}

export class PublisherSubscriptionDataTypeIdArrayCorrectnessTableValue extends BaseIntegerArrayCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.PublisherSubscriptionDataTypeIdArray;
    }
}

export class ShortSellTypeIdArrayMyxLitIvemAttributeCorrectnessTableValue extends BaseIntegerArrayCorrectnessTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.ShortSellTypeIdArrayMyxLitIvemAttribute;
    }
}

export class LitIvemIdArrayCorrectnessTableValue extends GenericCorrectnessTableValue<readonly LitIvemId[]> {
    protected createRenderValue() {
        return new LitIvemIdArrayRenderValue(this.data);
    }
}
