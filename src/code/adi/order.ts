/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../res/internal-api';
import {
    CorrectnessId,
    Decimal,
    EnumInfoOutOfOrderError,
    ErrorCode,
    FieldDataTypeId,
    Integer,
    MapKey,
    MultiEvent,
    SourceTzOffsetDateTime,
    ValueRecentChangeTypeId,
    ZenithDataError,
    isArrayEqualUniquely,
    isDecimalEqual,
    isSamePossiblyUndefinedArray,
    isUndefinableDecimalEqual,
    logger,
    newDecimal
} from "../sys/internal-api";
import { Account } from './account';
import { BrokerageAccountRecord } from './brokerage-account-record';
import {
    BrokerageAccountId,
    Currency,
    CurrencyId,
    ExchangeId,
    ExchangeInfo,
    ImmediateOrderTrigger,
    IvemClassId,
    IvemId,
    LitIvemId,
    MarketBoardId,
    MarketId,
    MarketInfo,
    MarketOrderRoute,
    OrderExtendedSide,
    OrderExtendedSideId,
    OrderId,
    OrderPriceUnitType,
    OrderPriceUnitTypeId,
    OrderRoute,
    OrderRouteAlgorithmId,
    OrderShortSellTypeId,
    OrderSide,
    OrderSideId,
    OrderStatus,
    OrderStatuses,
    OrderTrigger,
    OrderTriggerTypeId,
    OrderTypeId,
    OrdersDataMessage,
    TimeInForce,
    TimeInForceId,
    TradingEnvironment,
    TradingEnvironmentId
} from "./common/internal-api";

export class Order implements BrokerageAccountRecord {
    private _id: OrderId;
    private readonly _accountId: BrokerageAccountId;
    private _externalId: string | undefined;
    private _depthOrderId: string | undefined;
    private _marketId: MarketId | undefined;
    private _marketBoardId: MarketBoardId | undefined;
    private _currencyId: CurrencyId | undefined;
    private _estimatedBrokerage: Decimal | undefined;
    private _currentBrokerage: Decimal | undefined;
    private _estimatedTax: Decimal | undefined;
    private _currentTax: Decimal | undefined;
    private _currentValue: Decimal;
    private _createdDate: SourceTzOffsetDateTime;
    private _updatedDate: SourceTzOffsetDateTime;
    private _children: string[] | undefined;
    private _executedQuantity: Integer;
    private _averagePrice: Decimal | undefined;
    // details
    private _styleId: IvemClassId;
    private _exchangeId: ExchangeId;
    private _environmentId: TradingEnvironmentId;
    private _code: string;
    private _sideId: OrderSideId;
    private _extendedSideId: OrderExtendedSideId;
    private _brokerageSchedule: string | undefined;
    // equity details
    private _equityOrderTypeId: OrderTypeId;
    private _limitPrice: Decimal | undefined;
    private _quantity: Integer;
    private _hiddenQuantity: Integer | undefined;
    private _minimumQuantity: Integer | undefined;
    private _timeInForceId: TimeInForceId;
    private _expiryDate: SourceTzOffsetDateTime | undefined;
    private _shortSellTypeId: OrderShortSellTypeId | undefined;
    // managed fund details
    private _unitTypeId: OrderPriceUnitTypeId;
    private _unitAmount: Decimal;
    private _managedFundCurrency: string | undefined;
    private _physicalDelivery: boolean | undefined;
    // route
    private _route: OrderRoute;
    // condition
    private _trigger: OrderTrigger;

    private _status: string;
    private _statusAllowIds: OrderStatus.AllowIds = [];
    private _statusReasonIds: OrderStatus.ReasonIds = [];

    private _mapKey: MapKey | undefined;

    private _changedMultiEvent = new MultiEvent<Order.ChangedEventHandler>();
    private _correctnessChangedMultiEvent = new MultiEvent<Order.CorrectnessChangedEventHandler>();

    constructor(private readonly _account: Account,
        change: OrdersDataMessage.AddChange,
        private _correctnessId: CorrectnessId
    ) {
        this._id = change.id;
        this._accountId = change.accountId;
        this._externalId = change.externalId;
        this._depthOrderId = change.depthOrderId;
        this._marketId = change.marketId;
        this._marketBoardId = change.marketBoardId;
        this._currencyId = change.currencyId;
        this._estimatedBrokerage = change.estimatedBrokerage;
        this._currentBrokerage = change.currentBrokerage;
        this._estimatedTax = change.estimatedTax;
        this._currentTax = change.currentTax;
        this._currentValue = change.currentValue;
        this._createdDate = change.createdDate;
        this._updatedDate = change.updatedDate;
        this._children = change.children;
        this._executedQuantity = change.executedQuantity;
        if (change.averagePrice === null) {
            this._averagePrice = undefined;
        } else {
            this._averagePrice = change.averagePrice;
        }
        this._exchangeId = change.exchangeId;
        this._environmentId = change.environmentId;
        this._code = change.code;
        this._sideId = change.sideId;
        this._extendedSideId = this.calculateExtendedSideId(change);
        this._brokerageSchedule = change.brokerageSchedule;
        this._equityOrderTypeId = change.equityOrderTypeId;
        this._limitPrice = change.limitPrice;
        this._quantity = change.quantity;
        this._hiddenQuantity = change.hiddenQuantity;
        this._minimumQuantity = change.minimumQuantity;
        this._timeInForceId = change.timeInForceId;
        this._expiryDate = change.expiryDate;
        this._shortSellTypeId = change.shortSellTypeId;
        this._unitTypeId = change.unitTypeId;
        this._unitAmount = change.unitAmount;
        this._managedFundCurrency = change.managedFundCurrency;
        this._physicalDelivery = change.physicalDelivery;
        this._route = change.route;
        this._trigger = change.trigger;

        this.setStatus(change.status);
    }

    get account() { return this._account; }

    get id() { return this._id; }
    get accountId() { return this._accountId; }
    get externalId() { return this._externalId; }
    get depthOrderId() { return this._depthOrderId; }
    get marketId() { return this._marketId; }
    get marketBoardId() { return this._marketBoardId; }
    get currencyId() { return this._currencyId; }
    get estimatedBrokerage() { return this._estimatedBrokerage; }
    get currentBrokerage() { return this._currentBrokerage; }
    get estimatedTax() { return this._estimatedTax; }
    get currentTax() { return this._currentTax; }
    get currentValue() { return this._currentValue; }
    get createdDate() { return this._createdDate; }
    get updatedDate() { return this._updatedDate; }
    get children() { return this._children; }
    get executedQuantity() { return this._executedQuantity; }
    get averagePrice() { return this._averagePrice; }
    get styleId() { return this._styleId; }
    get exchangeId() { return this._exchangeId; }
    get environmentId() { return this._environmentId; }
    get code() { return this._code; }
    get sideId() { return this._sideId; }
    get extendedSideId() { return this._extendedSideId; }
    get brokerageSchedule() { return this._brokerageSchedule; }
    get equityOrderTypeId() { return this._equityOrderTypeId; }
    get limitPrice() { return this._limitPrice; }
    get quantity() { return this._quantity; }
    get hiddenQuantity() { return this._hiddenQuantity; }
    get minimumQuantity() { return this._minimumQuantity; }
    get timeInForceId() { return this._timeInForceId; }
    get expiryDate() { return this._expiryDate; }
    get shortSellTypeId() { return this._shortSellTypeId; }
    get unitTypeId() { return this._unitTypeId; }
    get unitAmount() { return this._unitAmount; }
    get managedFundCurrency() { return this._managedFundCurrency; }
    get physicalDelivery() { return this._physicalDelivery; }
    get route() { return this._route; }
    get trigger() { return this._trigger; }

    get status() { return this._status; }
    get statusAllowIds() { return this._statusAllowIds; }
    get statusReasonIds() { return this._statusReasonIds; }

    get correctnessId() { return this._correctnessId; }

    get mapKey() {
        if (this._mapKey === undefined) {
            this._mapKey = Order.Key.generateMapKey(this.id, this.accountId);
        }
        return this._mapKey;
    }
    get accountMapKey() { return this._account.mapKey; }

    get litIvemId() {
        if (this.marketId === undefined) {
            return undefined;
        } else {
            return new LitIvemId(this.code, this.marketId);
        }
    }
    get ivemId() {
        return new IvemId(this.code, this.exchangeId);
    }

    get routeAlgorithmId(): OrderRouteAlgorithmId {
        return this.route.algorithmId;
    }
    get routeMarketId(): MarketId | undefined {
        if (this.route instanceof MarketOrderRoute) {
            return this.route.marketId;
        } else {
            return undefined;
        }
    }

    get triggerTypeId(): OrderTriggerTypeId {
        return this.trigger.typeId;
    }

    get triggerValue() {
        return this.trigger.value;
    }
    get triggerExtraParamsText() {
        return this.trigger.extraParamsText;
    }

    dispose() {
        // no resources to release
    }

    createKey(): Order.Key {
        return new Order.Key(this.id, this.accountId);
    }

    setListCorrectness(value: CorrectnessId) {
        if (value !== this._correctnessId) {
            this._correctnessId = value;
            this.notifyCorrectnessChanged();
        }
    }

    update(change: OrdersDataMessage.AddUpdateChange) {
        const valueChanges = new Array<Order.ValueChange>(Order.Field.count);
        let changedIdx = 0;

        if (change.id !== this._id) {
            this._id = change.id;
            valueChanges[changedIdx++] = { fieldId: Order.FieldId.Id, recentChangeTypeId: undefined };
        }

        if (change.accountId !== this._accountId) {
            throw new ZenithDataError(ErrorCode.OU09882468723, JSON.stringify(change));
        }

        if (change.externalId !== this._externalId) {
            this._externalId = change.externalId;
            valueChanges[changedIdx++] = { fieldId: Order.FieldId.ExternalId, recentChangeTypeId: ValueRecentChangeTypeId.Update };
        }

        if (change.depthOrderId !== this._depthOrderId) {
            this._depthOrderId = change.depthOrderId;
            valueChanges[changedIdx++] = {
                fieldId: Order.FieldId.DepthOrderId,
                recentChangeTypeId: ValueRecentChangeTypeId.Update
            };
        }

        if (change.status !== this._status) {
            const allowReasonChangedFieldIds = this.setStatus(change.status);
            valueChanges[changedIdx++] = { fieldId: Order.FieldId.Status, recentChangeTypeId: ValueRecentChangeTypeId.Update };
            for (const fieldId of allowReasonChangedFieldIds) {
                valueChanges[changedIdx++] = {
                    fieldId,
                    recentChangeTypeId: ValueRecentChangeTypeId.Update
                };
            }
        }

        if (change.marketId !== this._marketId) {
            this._marketId = change.marketId;
            valueChanges[changedIdx++] = { fieldId: Order.FieldId.MarketId, recentChangeTypeId: ValueRecentChangeTypeId.Update };
        }

        if (change.marketBoardId !== this._marketBoardId) {
            this._marketBoardId = change.marketBoardId;
            valueChanges[changedIdx++] = {
                fieldId: Order.FieldId.TradingMarket,
                recentChangeTypeId: ValueRecentChangeTypeId.Update
            };
        }

        if (change.currencyId !== this._currencyId) {
            this._currencyId = change.currencyId;
            valueChanges[changedIdx++] = { fieldId: Order.FieldId.CurrencyId, recentChangeTypeId: ValueRecentChangeTypeId.Update };
        }

        if (!isUndefinableDecimalEqual(change.estimatedBrokerage, this._estimatedBrokerage)) {
            this._estimatedBrokerage = change.estimatedBrokerage;
            valueChanges[changedIdx++] = {
                fieldId: Order.FieldId.EstimatedBrokerage,
                recentChangeTypeId: ValueRecentChangeTypeId.Update
            };
        }

        if (!isUndefinableDecimalEqual(change.currentBrokerage, this._currentBrokerage)) {
            this._currentBrokerage = change.currentBrokerage;
            valueChanges[changedIdx++] = {
                fieldId: Order.FieldId.CurrentBrokerage,
                recentChangeTypeId: ValueRecentChangeTypeId.Update
            };
        }

        if (!isUndefinableDecimalEqual(change.estimatedTax, this._estimatedTax)) {
            this._estimatedTax = change.estimatedTax;
            valueChanges[changedIdx++] = {
                fieldId: Order.FieldId.EstimatedTax,
                recentChangeTypeId: ValueRecentChangeTypeId.Update
            };
        }

        if (!isUndefinableDecimalEqual(change.currentTax, this._currentTax)) {
            this._currentTax = change.currentTax;
            valueChanges[changedIdx++] = { fieldId: Order.FieldId.CurrentTax, recentChangeTypeId: ValueRecentChangeTypeId.Update };
        }

        if (!isUndefinableDecimalEqual(change.currentValue, this._currentValue)) {
            this._currentValue = change.currentValue;
            valueChanges[changedIdx++] = {
                fieldId: Order.FieldId.CurrentValue,
                recentChangeTypeId: ValueRecentChangeTypeId.Update
            };
        }

        if (change.createdDate !== this._createdDate) {
            this._createdDate = change.createdDate;
            valueChanges[changedIdx++] = {
                fieldId: Order.FieldId.CreatedDate,
                recentChangeTypeId: ValueRecentChangeTypeId.Update
            };
        }

        if (change.updatedDate !== this._updatedDate) {
            this._updatedDate = change.updatedDate;
            valueChanges[changedIdx++] = {
                fieldId: Order.FieldId.UpdatedDate,
                recentChangeTypeId: ValueRecentChangeTypeId.Update
            };
        }

        if (change.styleId !== this._styleId) {
            this._styleId = change.styleId;
            valueChanges[changedIdx++] = { fieldId: Order.FieldId.StyleId, recentChangeTypeId: ValueRecentChangeTypeId.Update };
        }

        if (!isSamePossiblyUndefinedArray<string>(change.children, this._children)) {
            this._children = change.children;
            valueChanges[changedIdx++] = { fieldId: Order.FieldId.Children, recentChangeTypeId: ValueRecentChangeTypeId.Update };
        }

        if (change.executedQuantity !== this._executedQuantity) {
            this._executedQuantity = change.executedQuantity;
            valueChanges[changedIdx++] = {
                fieldId: Order.FieldId.ExecutedQuantity,
                recentChangeTypeId: ValueRecentChangeTypeId.Update
            };
        }

        if (change.averagePrice !== undefined) {
            if (change.averagePrice === null) {
                if (this._averagePrice !== undefined) {
                    this._averagePrice = undefined;
                    valueChanges[changedIdx++] = {
                        fieldId: Order.FieldId.AveragePrice,
                        recentChangeTypeId: ValueRecentChangeTypeId.Update
                    };
                }
            } else {
                if (this._averagePrice === undefined || !isDecimalEqual(change.averagePrice, this._averagePrice)) {
                    this._averagePrice = change.averagePrice;
                    valueChanges[changedIdx++] = {
                        fieldId: Order.FieldId.AveragePrice,
                        recentChangeTypeId: ValueRecentChangeTypeId.Update
                    };
                }
            }
        }

        if (change.exchangeId !== this._exchangeId) {
            this._exchangeId = change.exchangeId;
            valueChanges[changedIdx++] = { fieldId: Order.FieldId.ExchangeId, recentChangeTypeId: ValueRecentChangeTypeId.Update };
        }

        if (change.environmentId !== this._environmentId) {
            this._environmentId = change.environmentId;
            valueChanges[changedIdx++] = {
                fieldId: Order.FieldId.EnvironmentId,
                recentChangeTypeId: ValueRecentChangeTypeId.Update
            };
        }

        if (change.code !== this._code) {
            this._code = change.code;
            valueChanges[changedIdx++] = { fieldId: Order.FieldId.Code, recentChangeTypeId: ValueRecentChangeTypeId.Update };
        }

        if (change.sideId !== this._sideId) {
            this._sideId = change.sideId;
            valueChanges[changedIdx++] = { fieldId: Order.FieldId.SideId, recentChangeTypeId: ValueRecentChangeTypeId.Update };
        }

        const newExtendedSideId = this.calculateExtendedSideId(change);

        if (newExtendedSideId !== this._extendedSideId) {
            this._extendedSideId = newExtendedSideId;
            valueChanges[changedIdx++] = { fieldId: Order.FieldId.ExtendedSideId, recentChangeTypeId: ValueRecentChangeTypeId.Update };
        }

        if (change.brokerageSchedule !== this._brokerageSchedule) {
            this._brokerageSchedule = change.brokerageSchedule;
            valueChanges[changedIdx++] = {
                fieldId: Order.FieldId.BrokerageSchedule,
                recentChangeTypeId: ValueRecentChangeTypeId.Update
            };
        }

        if (change.equityOrderTypeId !== this._equityOrderTypeId) {
            this._equityOrderTypeId = change.equityOrderTypeId;
            valueChanges[changedIdx++] = {
                fieldId: Order.FieldId.EquityOrderTypeId,
                recentChangeTypeId: ValueRecentChangeTypeId.Update
            };
        }

        if (change.limitPrice === undefined) {
            if (this._limitPrice !== undefined) {
                this._limitPrice = undefined;
                valueChanges[changedIdx++] = {
                    fieldId: Order.FieldId.LimitPrice,
                    recentChangeTypeId: ValueRecentChangeTypeId.Update
                };
            }
        } else {
            if (this._limitPrice === undefined || !isDecimalEqual(change.limitPrice, this._limitPrice)) {
                this._limitPrice = change.limitPrice;
                valueChanges[changedIdx++] = {
                    fieldId: Order.FieldId.LimitPrice,
                    recentChangeTypeId: ValueRecentChangeTypeId.Update
                };
            }
        }

        if (change.quantity !== this._quantity) {
            this._quantity = change.quantity;
            valueChanges[changedIdx++] = { fieldId: Order.FieldId.Quantity, recentChangeTypeId: ValueRecentChangeTypeId.Update };
        }

        if (change.hiddenQuantity !== this._hiddenQuantity) {
            this._hiddenQuantity = change.hiddenQuantity;
            valueChanges[changedIdx++] = {
                fieldId: Order.FieldId.HiddenQuantity,
                recentChangeTypeId: ValueRecentChangeTypeId.Update
            };
        }

        if (change.minimumQuantity !== this._minimumQuantity) {
            this._minimumQuantity = change.minimumQuantity;
            valueChanges[changedIdx++] = {
                fieldId: Order.FieldId.MinimumQuantity,
                recentChangeTypeId: ValueRecentChangeTypeId.Update
            };
        }

        if (change.timeInForceId !== this._timeInForceId) {
            this._timeInForceId = change.timeInForceId;
            valueChanges[changedIdx++] = {
                fieldId: Order.FieldId.TimeInForceId,
                recentChangeTypeId: ValueRecentChangeTypeId.Update
            };
        }

        if (!SourceTzOffsetDateTime.isUndefinableEqual(change.expiryDate, this._expiryDate)) {
            this._expiryDate = change.expiryDate;
            valueChanges[changedIdx++] = { fieldId: Order.FieldId.ExpiryDate, recentChangeTypeId: ValueRecentChangeTypeId.Update };
        }

        if (change.shortSellTypeId !== this._shortSellTypeId) {
            this._shortSellTypeId = change.shortSellTypeId;
            valueChanges[changedIdx++] = { fieldId: Order.FieldId.ShortSellTypeId, recentChangeTypeId: ValueRecentChangeTypeId.Update };
        }

        if (change.unitTypeId !== this._unitTypeId) {
            this._unitTypeId = change.unitTypeId;
            valueChanges[changedIdx++] = { fieldId: Order.FieldId.UnitTypeId, recentChangeTypeId: ValueRecentChangeTypeId.Update };
        }

        if (!isUndefinableDecimalEqual(change.unitAmount, this._unitAmount)) {
            this._unitAmount = change.unitAmount;
            valueChanges[changedIdx++] = { fieldId: Order.FieldId.UnitAmount, recentChangeTypeId: ValueRecentChangeTypeId.Update };
        }

        if (change.managedFundCurrency !== this._managedFundCurrency) {
            this._managedFundCurrency = change.managedFundCurrency;
            valueChanges[changedIdx++] = {
                fieldId: Order.FieldId.ManagedFundCurrency,
                recentChangeTypeId: ValueRecentChangeTypeId.Update
            };
        }

        if (change.physicalDelivery !== this._physicalDelivery) {
            this._physicalDelivery = change.physicalDelivery;
            valueChanges[changedIdx++] = {
                fieldId: Order.FieldId.PhysicalDelivery,
                recentChangeTypeId: ValueRecentChangeTypeId.Update
            };
        }

        if (!OrderRoute.isEqual(change.route, this._route)) {
            const oldRouteAlgorithmId = this.routeAlgorithmId;
            const oldRouteMarketId = this.routeMarketId;
            this._route = change.route;
            if (this.routeAlgorithmId !== oldRouteAlgorithmId) {
                valueChanges[changedIdx++] = {
                    fieldId: Order.FieldId.RouteAlgorithmId,
                    recentChangeTypeId: ValueRecentChangeTypeId.Update
                };
            }
            if (this.routeMarketId !== oldRouteMarketId) {
                valueChanges[changedIdx++] = {
                    fieldId: Order.FieldId.RouteMarketId,
                    recentChangeTypeId: ValueRecentChangeTypeId.Update
                };
            }
        }

        if (!OrderTrigger.isEqual(change.trigger, this._trigger)) {
            const oldTriggerTypeId = this.triggerTypeId;
            const oldTriggerValue = this.triggerValue;
            const oldTriggerExtraParamsText = this.triggerExtraParamsText;
            this._trigger = change.trigger;
            if (this.triggerTypeId !== oldTriggerTypeId) {
                valueChanges[changedIdx++] = {
                    fieldId: Order.FieldId.TriggerTypeId,
                    recentChangeTypeId: ValueRecentChangeTypeId.Update
                };
            }
            if (this.triggerValue !== oldTriggerValue) {
                valueChanges[changedIdx++] = {
                    fieldId: Order.FieldId.TriggerValue,
                    recentChangeTypeId: ValueRecentChangeTypeId.Update
                };
            }
            if (this.triggerExtraParamsText !== oldTriggerExtraParamsText) {
                valueChanges[changedIdx++] = {
                    fieldId: Order.FieldId.TriggerExtraParams,
                    recentChangeTypeId: ValueRecentChangeTypeId.Update
                };
            }
        }

        if (changedIdx >= 0) {
            valueChanges.length = changedIdx;
            this.notifyChanged(valueChanges);
        }
    }

    canTrade() {
        return this.statusAllowIds.includes(OrderStatus.AllowId.Trade);
    }

    canAmend() {
        return this.statusAllowIds.includes(OrderStatus.AllowId.Amend);
    }

    canCancel() {
        return this.statusAllowIds.includes(OrderStatus.AllowId.Trade);
    }

    generateMapKey(): MapKey {
        return Order.Key.generateMapKey(this.id, this.accountId);
    }

    subscribeChangedEvent(handler: Order.ChangedEventHandler) {
        return this._changedMultiEvent.subscribe(handler);
    }

    unsubscribeChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._changedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeCorrectnessChangedEvent(handler: Order.CorrectnessChangedEventHandler) {
        return this._correctnessChangedMultiEvent.subscribe(handler);
    }

    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private notifyChanged(valueChanges: Order.ValueChange[]) {
        const handlers = this._changedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](valueChanges);
        }
    }

    private notifyCorrectnessChanged() {
        const handlers = this._correctnessChangedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index]();
        }
    }

    private setStatus(value: string) {
        if (value === this._status) {
            return [];
        } else {
            this._status = value;
            return this.updateStatusAllowReasonIds();
        }
    }

    private calculateExtendedSideId(change: OrdersDataMessage.AddUpdateChange) {
        return OrderExtendedSide.calculateFromSideExchangeShortSellTypeInstructions(
            change.sideId,
            change.exchangeId,
            change.shortSellTypeId,
            change.instructionIds
        );
    }

    private updateStatusAllowReasonIds() {
        let statusAllowIds: OrderStatus.AllowIds;
        let statusReasonIds: OrderStatus.ReasonIds;

        const orderStatus = OrderStatuses.find(this._account.tradingFeed.orderStatuses, this.status);
        if (orderStatus === undefined) {
            statusAllowIds = [];
            statusReasonIds = [];
            logger.logError(`OrderStatus not available for status: ${this.status} on account: ${this._account.id}`);
        } else {
            statusAllowIds = orderStatus.allowIds;
            statusReasonIds = orderStatus.reasonIds;
        }

        const result = new Array<Order.FieldId>(2);
        let fieldChangeCount = 0;

        if (!isArrayEqualUniquely(statusAllowIds, this.statusAllowIds)) {
            this._statusAllowIds = statusAllowIds;
            result[fieldChangeCount++] = Order.FieldId.StatusAllowIds;
        }
        if (!isArrayEqualUniquely(statusReasonIds, this.statusReasonIds)) {
            this._statusReasonIds = statusReasonIds;
            result[fieldChangeCount++] = Order.FieldId.StatusReasonIds;
        }

        result.length = fieldChangeCount;
        return result;
    }
}

export namespace Order {
    export type Id = OrderId;
    export const NullId = '';

    export type ChangedEventHandler = (this: void, valueChanges: Order.ValueChange[]) => void;
    export type CorrectnessChangedEventHandler = (this: void) => void;

    export const enum FieldId {
        Id,
        AccountId,
        ExternalId,
        DepthOrderId,
        Status,
        StatusAllowIds,
        StatusReasonIds,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        MarketId,
        TradingMarket,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        CurrencyId,
        EstimatedBrokerage,
        CurrentBrokerage,
        EstimatedTax,
        CurrentTax,
        CurrentValue,
        CreatedDate,
        UpdatedDate,
        StyleId,
        Children,
        ExecutedQuantity,
        AveragePrice,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        ExchangeId,
        EnvironmentId,
        Code,
        SideId,
        ExtendedSideId,
        BrokerageSchedule,
        EquityOrderTypeId,
        LimitPrice,
        Quantity,
        HiddenQuantity,
        MinimumQuantity,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        TimeInForceId,
        ExpiryDate,
        ShortSellTypeId,
        UnitTypeId,
        UnitAmount,
        ManagedFundCurrency,
        PhysicalDelivery,
        RouteAlgorithmId,
        RouteMarketId,
        TriggerTypeId,
        TriggerValue,
        TriggerExtraParams,
    }

    export namespace Field {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export type Id = Order.FieldId;
        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly dataTypeId: FieldDataTypeId;
            readonly displayId: StringId;
            readonly headingId: StringId;
        }

        type InfoObject = { [id in keyof typeof FieldId]: Info };

        const infoObject: InfoObject = {
            Id: {
                id: FieldId.Id,
                name: 'Id',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.OrderFieldDisplay_Id,
                headingId: StringId.OrderFieldHeading_Id,
            },
            AccountId: {
                id: FieldId.AccountId,
                name: 'AccountId',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.OrderFieldDisplay_AccountId,
                headingId: StringId.OrderFieldHeading_AccountId,
            },
            ExternalId: {
                id: FieldId.ExternalId,
                name: 'ExternalID',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.OrderFieldDisplay_ExternalID,
                headingId: StringId.OrderFieldHeading_ExternalID,
            },
            DepthOrderId: {
                id: FieldId.DepthOrderId,
                name: 'DepthOrderID',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.OrderFieldDisplay_DepthOrderID,
                headingId: StringId.OrderFieldHeading_DepthOrderID,
            },
            Status: {
                id: FieldId.Status,
                name: 'Status',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.OrderFieldDisplay_Status,
                headingId: StringId.OrderFieldHeading_Status,
            },
            StatusAllowIds: {
                id: FieldId.StatusAllowIds,
                name: 'StatusAllowIds',
                dataTypeId: FieldDataTypeId.EnumerationArray,
                displayId: StringId.OrderFieldDisplay_StatusAllowIds,
                headingId: StringId.OrderFieldHeading_StatusAllowIds,
            },
            StatusReasonIds: {
                id: FieldId.StatusReasonIds,
                name: 'StatusReasonIds',
                dataTypeId: FieldDataTypeId.EnumerationArray,
                displayId: StringId.OrderFieldDisplay_StatusReasonIds,
                headingId: StringId.OrderFieldHeading_StatusReasonIds,
            },
            MarketId: {
                id: FieldId.MarketId,
                name: 'Market',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.OrderFieldDisplay_Market,
                headingId: StringId.OrderFieldHeading_Market,
            },
            TradingMarket: {
                id: FieldId.TradingMarket,
                name: 'TradingMarket',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.OrderFieldDisplay_TradingMarket,
                headingId: StringId.OrderFieldHeading_TradingMarket,
            },
            CurrencyId: {
                id: FieldId.CurrencyId,
                name: 'Currency',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.OrderFieldDisplay_Currency,
                headingId: StringId.OrderFieldHeading_Currency,
            },
            EstimatedBrokerage: {
                id: FieldId.EstimatedBrokerage,
                name: 'EstimatedBrokerage',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.OrderFieldDisplay_EstimatedBrokerage,
                headingId: StringId.OrderFieldHeading_EstimatedBrokerage,
            },
            CurrentBrokerage: {
                id: FieldId.CurrentBrokerage,
                name: 'CurrentBrokerage',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.OrderFieldDisplay_CurrentBrokerage,
                headingId: StringId.OrderFieldHeading_CurrentBrokerage,
            },
            EstimatedTax: {
                id: FieldId.EstimatedTax,
                name: 'EstimatedTax',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.OrderFieldDisplay_EstimatedTax,
                headingId: StringId.OrderFieldHeading_EstimatedTax,
            },
            CurrentTax: {
                id: FieldId.CurrentTax,
                name: 'CurrentTax',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.OrderFieldDisplay_CurrentTax,
                headingId: StringId.OrderFieldHeading_CurrentTax,
            },
            CurrentValue: {
                id: FieldId.CurrentValue,
                name: 'CurrentValue',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.OrderFieldDisplay_CurrentValue,
                headingId: StringId.OrderFieldHeading_CurrentValue,
            },
            CreatedDate: {
                id: FieldId.CreatedDate,
                name: 'CreatedDate',
                dataTypeId: FieldDataTypeId.DateTime,
                displayId: StringId.OrderFieldDisplay_CreatedDate,
                headingId: StringId.OrderFieldHeading_CreatedDate,
            },
            UpdatedDate: {
                id: FieldId.UpdatedDate,
                name: 'UpdatedDate',
                dataTypeId: FieldDataTypeId.DateTime,
                displayId: StringId.OrderFieldDisplay_UpdatedDate,
                headingId: StringId.OrderFieldHeading_UpdatedDate,
            },
            StyleId: {
                id: FieldId.StyleId,
                name: 'Style',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.OrderFieldDisplay_Style,
                headingId: StringId.OrderFieldHeading_Style,
            },
            Children: {
                id: FieldId.Children,
                name: 'Children',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.OrderFieldDisplay_Children,
                headingId: StringId.OrderFieldHeading_Children,
            },
            ExecutedQuantity: {
                id: FieldId.ExecutedQuantity,
                name: 'ExecutedQuantity',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.OrderFieldDisplay_ExecutedQuantity,
                headingId: StringId.OrderFieldHeading_ExecutedQuantity,
            },
            AveragePrice: {
                id: FieldId.AveragePrice,
                name: 'AveragePrice',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.OrderFieldDisplay_AveragePrice,
                headingId: StringId.OrderFieldHeading_AveragePrice,
            },
            ExchangeId: {
                id: FieldId.ExchangeId,
                name: 'Exchange',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.OrderFieldDisplay_Exchange,
                headingId: StringId.OrderFieldHeading_Exchange,
            },
            EnvironmentId: {
                id: FieldId.EnvironmentId,
                name: 'Environment',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.OrderFieldDisplay_Environment,
                headingId: StringId.OrderFieldHeading_Environment,
            },
            Code: {
                id: FieldId.Code,
                name: 'Code',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.OrderFieldDisplay_Code,
                headingId: StringId.OrderFieldHeading_Code,
            },
            SideId: {
                id: FieldId.SideId,
                name: 'DetailsSide',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.OrderFieldDisplay_Side,
                headingId: StringId.OrderFieldHeading_Side,
            },
            ExtendedSideId: {
                id: FieldId.ExtendedSideId,
                name: 'DetailsExtendedSide',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.OrderFieldDisplay_ExtendedSide,
                headingId: StringId.OrderFieldHeading_ExtendedSide,
            },
            BrokerageSchedule: {
                id: FieldId.BrokerageSchedule,
                name: 'DetailsBrokerageSchedule',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.OrderFieldDisplay_BrokerageSchedule,
                headingId: StringId.OrderFieldHeading_BrokerageSchedule,
            },
            EquityOrderTypeId: {
                id: FieldId.EquityOrderTypeId,
                name: 'DetailsType',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.OrderFieldDisplay_DetailsType,
                headingId: StringId.OrderFieldHeading_DetailsType,
            },
            LimitPrice: {
                id: FieldId.LimitPrice,
                name: 'DetailsLimitPrice',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.OrderFieldDisplay_LimitPrice,
                headingId: StringId.OrderFieldHeading_LimitPrice,
            },
            Quantity: {
                id: FieldId.Quantity,
                name: 'DetailsQuantity',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.OrderFieldDisplay_Quantity,
                headingId: StringId.OrderFieldHeading_Quantity,
            },
            HiddenQuantity: {
                id: FieldId.HiddenQuantity,
                name: 'DetailsHiddenQuantity',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.OrderFieldDisplay_HiddenQuantity,
                headingId: StringId.OrderFieldHeading_HiddenQuantity,
            },
            MinimumQuantity: {
                id: FieldId.MinimumQuantity,
                name: 'DetailsMinimumQuantity',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.OrderFieldDisplay_MinimumQuantity,
                headingId: StringId.OrderFieldHeading_MinimumQuantity,
            },
            TimeInForceId: {
                id: FieldId.TimeInForceId,
                name: 'DetailsTimeInForce',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.OrderFieldDisplay_DetailsTimeInForce,
                headingId: StringId.OrderFieldHeading_DetailsTimeInForce,
            },
            ExpiryDate: {
                id: FieldId.ExpiryDate,
                name: 'DetailsExpiryDate',
                dataTypeId: FieldDataTypeId.Date,
                displayId: StringId.OrderFieldDisplay_DetailsExpiryDate,
                headingId: StringId.OrderFieldHeading_DetailsExpiryDate,
            },
            ShortSellTypeId: {
                id: FieldId.ShortSellTypeId,
                name: 'DetailsShortSellType',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.OrderFieldDisplay_DetailsShortSellType,
                headingId: StringId.OrderFieldHeading_DetailsShortSellType,
            },
            UnitTypeId: {
                id: FieldId.UnitTypeId,
                name: 'DetailsUnitType',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.OrderFieldDisplay_DetailsUnitType,
                headingId: StringId.OrderFieldHeading_DetailsUnitType,
            },
            UnitAmount: {
                id: FieldId.UnitAmount,
                name: 'DetailsUnitAmount',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.OrderFieldDisplay_DetailsUnitAmount,
                headingId: StringId.OrderFieldHeading_DetailsUnitAmount,
            },
            ManagedFundCurrency: {
                id: FieldId.ManagedFundCurrency,
                name: 'DetailsCurrency',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.OrderFieldDisplay_DetailsCurrency,
                headingId: StringId.OrderFieldHeading_DetailsCurrency,
            },
            PhysicalDelivery: {
                id: FieldId.PhysicalDelivery,
                name: 'DetailsPhysicalDelivery',
                dataTypeId: FieldDataTypeId.Boolean,
                displayId: StringId.OrderFieldDisplay_DetailsPhysicalDelivery,
                headingId: StringId.OrderFieldHeading_DetailsPhysicalDelivery,
            },
            RouteAlgorithmId: {
                id: FieldId.RouteAlgorithmId,
                name: 'RouteAlgorithm',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.OrderFieldDisplay_RouteAlgorithm,
                headingId: StringId.OrderFieldHeading_RouteAlgorithm,
            },
            RouteMarketId: {
                id: FieldId.RouteMarketId,
                name: 'RouteMarket',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.OrderFieldDisplay_RouteMarket,
                headingId: StringId.OrderFieldHeading_RouteMarket,
            },
            TriggerTypeId: {
                id: FieldId.TriggerTypeId,
                name: 'TriggerType',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.OrderFieldDisplay_TriggerType,
                headingId: StringId.OrderFieldHeading_TriggerType,
            },
            TriggerValue: {
                id: FieldId.TriggerValue,
                name: 'TriggerValue',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.OrderFieldDisplay_TriggerValue,
                headingId: StringId.OrderFieldHeading_TriggerValue,
            },
            TriggerExtraParams: {
                id: FieldId.TriggerExtraParams,
                name: 'TriggerExtraParams',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.OrderFieldDisplay_TriggerExtraParams,
                headingId: StringId.OrderFieldHeading_TriggerExtraParams,
            },
        };

        export const count = Object.keys(infoObject).length;
        const infos = Object.values(infoObject);

        export function idToName(id: Id) {
            return infos[id].name;
        }

        export function idToFieldDataTypeId(id: Id) {
            return infos[id].dataTypeId;
        }

        export function idToDisplayId(id: Id) {
            return infos[id].displayId;
        }

        export function idToHeadingId(id: Id) {
            return infos[id].headingId;
        }

        export function idToHeading(id: Id) {
            return Strings[idToHeadingId(id)];
        }

        export function initialiseStaticField() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index as FieldId);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('OIODIFIS3885', outOfOrderIdx, infos[outOfOrderIdx].name);
            }
        }
    }

    export class Key {
        static readonly JsonTag_OrderId = 'orderId';
        static readonly JsonTag_AccountId = 'accountId';

        private _mapKey: MapKey;

        constructor(public orderId: Id,
            public accountId: BrokerageAccountId) {
            this._mapKey = Key.generateMapKey(orderId, accountId);
        }

        get mapKey() {
            return this._mapKey;
        }

        static createNull() {
            // will not match any valid holding
            return new Key(NullId, BrokerageAccountId.nullId);
        }

        // saveToJson(element: JsonElement, includeEnvironment = false) {
        //     element.setString(Key.JsonTag_OrderId, this.orderId);
        //     element.setString(Key.JsonTag_AccountId, this.accountId);
        // }
    }

    export namespace Key {
        export function generateMapKey(orderId: Id,
            accountId: BrokerageAccountId): MapKey {
            return `${orderId}|${accountId}`;
        }

        export function isEqual(left: Key, right: Key) {
            return left.orderId === right.orderId && left.accountId === right.accountId;
        }

        // export function tryCreateFromJson(element: JsonElement) {
        //     const orderId = element.tryGetString(Key.JsonTag_OrderId);
        //     if (orderId === undefined) {
        //         return 'Undefined Order';
        //     } else {
        //         const accountId = element.tryGetString(Key.JsonTag_AccountId);
        //         if (accountId === undefined) {
        //             return 'Undefined Account';
        //         } else {
        //             return new Key(orderId, accountId);
        //         }
        //     }
        // }
    }

    export interface ValueChange {
        fieldId: FieldId;
        recentChangeTypeId: ValueRecentChangeTypeId | undefined;
    }

    export function createNotFoundOrder(key: Order.Key) {
        const accountKey = new Account.Key(key.accountId);

        const msgData: OrdersDataMessage.AddChange = {
            accountId: key.accountId,
            id: key.orderId,
            externalId: undefined,
            depthOrderId: undefined,
            status: '',
            marketId: undefined,
            marketBoardId: undefined,
            currencyId: Currency.nullCurrencyId,
            estimatedBrokerage: newDecimal(0),
            currentBrokerage: newDecimal(0),
            estimatedTax: newDecimal(0),
            currentTax: newDecimal(0),
            currentValue: newDecimal(0),
            createdDate: SourceTzOffsetDateTime.nullDateTime,
            updatedDate: SourceTzOffsetDateTime.nullDateTime,
            children: undefined,
            executedQuantity: 0,
            averagePrice: undefined,
            styleId: IvemClassId.Market,
            exchangeId: ExchangeInfo.nullId,
            environmentId: TradingEnvironment.getDefaultId(),
            code: '',
            sideId: OrderSide.nullId,
            brokerageSchedule: undefined,
            instructionIds: [],
            equityOrderTypeId: OrderTypeId.Market,
            limitPrice: undefined,
            quantity: 0,
            hiddenQuantity: undefined,
            minimumQuantity: undefined,
            timeInForceId: TimeInForce.nullId,
            expiryDate: undefined,
            shortSellTypeId: undefined,
            unitTypeId: OrderPriceUnitType.nullId,
            unitAmount: newDecimal(0),
            managedFundCurrency: undefined,
            physicalDelivery: undefined,
            route: new MarketOrderRoute(MarketInfo.nullId),
            trigger: new ImmediateOrderTrigger(),
        };

        const order = new Order(Account.createNotFoundAccount(accountKey),
            msgData,
            CorrectnessId.Error,
        );

        return order;
    }

    export function initialiseStatic() {
        Field.initialiseStaticField();
    }
}

export namespace OrderModule {
    export function initialiseStatic() {
        Order.initialiseStatic();
    }
}
